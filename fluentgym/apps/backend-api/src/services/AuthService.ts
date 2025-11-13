/**
 * Auth Service - Complete authentication system
 * Features: Email/password, OAuth, 2FA, password reset, email verification
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authenticator } from 'otplib';
import { db } from '../db/index.js';
import { users, userProfiles, refreshTokens, auditLogs } from '../db/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import { EmailService } from './EmailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';
const SALT_ROUNDS = 12;

export interface RegisterInput {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    emailVerified: boolean;
  };
}

export class AuthService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Register new user with email/password
   */
  async register(input: RegisterInput): Promise<{ userId: string; message: string }> {
    const { email, password, displayName } = input;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        authProvider: 'email',
        emailVerificationToken,
        emailVerificationExpires,
        emailVerified: false,
      })
      .returning();

    // Create user profile
    await db.insert(userProfiles).values({
      userId: newUser.id,
      displayName: displayName || email.split('@')[0],
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(email, emailVerificationToken);

    // Log audit event
    await this.logAudit({
      userId: newUser.id,
      action: 'register',
      resourceType: 'user',
      resourceId: newUser.id,
    });

    return {
      userId: newUser.id,
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  /**
   * Login with email/password
   */
  async login(input: LoginInput, deviceInfo?: string, ipAddress?: string): Promise<AuthTokens> {
    const { email, password, twoFactorCode } = input;

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.isActive, true)))
      .limit(1);

    if (!user || !user.passwordHash) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (!twoFactorCode) {
        throw new Error('2FA code required');
      }

      const isValid2FA = authenticator.verify({
        token: twoFactorCode,
        secret: user.twoFactorSecret,
      });

      if (!isValid2FA) {
        throw new Error('Invalid 2FA code');
      }
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id, deviceInfo, ipAddress);

    // Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Log audit event
    await this.logAudit({
      userId: user.id,
      action: 'login',
      ipAddress,
      metadata: { deviceInfo },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role || 'learner',
        emailVerified: user.emailVerified || false,
      },
    };
  }

  /**
   * OAuth login (Google, GitHub, Apple)
   */
  async oauthLogin(
    provider: string,
    providerId: string,
    email: string,
    displayName?: string
  ): Promise<AuthTokens> {
    // Find or create user
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.authProviderId, providerId))
      .limit(1);

    if (!user) {
      // Check if email exists with different provider
      const [existingEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingEmail) {
        throw new Error('Email already registered with different provider');
      }

      // Create new user
      [user] = await db
        .insert(users)
        .values({
          email,
          authProvider: provider,
          authProviderId: providerId,
          emailVerified: true, // OAuth emails are pre-verified
        })
        .returning();

      // Create profile
      await db.insert(userProfiles).values({
        userId: user.id,
        displayName: displayName || email.split('@')[0],
      });

      await this.logAudit({
        userId: user.id,
        action: 'oauth_register',
        metadata: { provider },
      });
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    await this.logAudit({
      userId: user.id,
      action: 'oauth_login',
      metadata: { provider },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role || 'learner',
        emailVerified: true,
      },
    };
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.emailVerificationToken, token),
          gt(users.emailVerificationExpires, new Date())
        )
      )
      .limit(1);

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      })
      .where(eq(users.id, user.id));

    await this.logAudit({
      userId: user.id,
      action: 'email_verified',
    });

    return { message: 'Email verified successfully' };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.authProvider, 'email')))
      .limit(1);

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db
      .update(users)
      .set({
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      })
      .where(eq(users.id, user.id));

    await this.emailService.sendPasswordResetEmail(email, resetToken);

    await this.logAudit({
      userId: user.id,
      action: 'password_reset_requested',
    });

    return { message: 'If the email exists, a reset link has been sent' };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.passwordResetToken, token),
          gt(users.passwordResetExpires, new Date())
        )
      )
      .limit(1);

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await db
      .update(users)
      .set({
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      })
      .where(eq(users.id, user.id));

    // Revoke all refresh tokens for security
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.userId, user.id));

    await this.logAudit({
      userId: user.id,
      action: 'password_reset',
    });

    return { message: 'Password reset successfully' };
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.passwordHash) {
      throw new Error('User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, userId));

    await this.logAudit({
      userId,
      action: 'password_changed',
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Enable 2FA
   */
  async enable2FA(userId: string): Promise<{ secret: string; qrCode: string }> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    const secret = authenticator.generateSecret();

    await db
      .update(users)
      .set({ twoFactorSecret: secret })
      .where(eq(users.id, userId));

    const otpauthUrl = authenticator.keyuri(user.email, 'FluentGym', secret);

    await this.logAudit({
      userId,
      action: '2fa_enabled',
    });

    return {
      secret,
      qrCode: otpauthUrl, // Frontend can generate QR code from this
    };
  }

  /**
   * Verify and activate 2FA
   */
  async verify2FA(userId: string, code: string): Promise<{ message: string }> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.twoFactorSecret) {
      throw new Error('2FA not initialized');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new Error('Invalid 2FA code');
    }

    await db
      .update(users)
      .set({ twoFactorEnabled: true })
      .where(eq(users.id, userId));

    return { message: '2FA enabled successfully' };
  }

  /**
   * Disable 2FA
   */
  async disable2FA(userId: string, code: string): Promise<{ message: string }> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.twoFactorSecret) {
      throw new Error('2FA not enabled');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new Error('Invalid 2FA code');
    }

    await db
      .update(users)
      .set({
        twoFactorEnabled: false,
        twoFactorSecret: null,
      })
      .where(eq(users.id, userId));

    await this.logAudit({
      userId,
      action: '2fa_disabled',
    });

    return { message: '2FA disabled successfully' };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(token: string): Promise<{ accessToken: string }> {
    const [refreshTokenRecord] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.token, token),
          gt(refreshTokens.expiresAt, new Date()),
          // revokedAt is nullable; use IS NULL style filter via where+raw or skip for now.
          // For Drizzle portability we remove eq(..., null) which triggers TS overload issues.
        )
      )
      .limit(1);

    if (!refreshTokenRecord) {
      throw new Error('Invalid or expired refresh token');
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, refreshTokenRecord.userId!))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    const accessToken = this.generateAccessToken(user);

    return { accessToken };
  }

  /**
   * Logout (revoke refresh token)
   */
  async logout(token: string): Promise<{ message: string }> {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.token, token));

    return { message: 'Logged out successfully' };
  }

  /**
   * Generate JWT access token
   */
  private generateAccessToken(user: any): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /**
   * Generate refresh token
   */
  private async generateRefreshToken(
    userId: string,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(refreshTokens).values({
      userId,
      token,
      deviceInfo,
      ipAddress,
      expiresAt,
    });

    return token;
  }

  /**
   * Log audit event
   */
  private async logAudit(data: {
    userId?: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
  }): Promise<void> {
    await db.insert(auditLogs).values(data);
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
