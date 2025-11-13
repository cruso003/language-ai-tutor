/**
 * Email Service - Send transactional emails
 * Uses Nodemailer with SMTP or AWS SES
 */

import nodemailer from 'nodemailer';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  /**
   * Send email verification link
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${FRONTEND_URL}/auth/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: '"FluentGym" <noreply@fluentgym.com>',
      to: email,
      subject: 'Verify Your Email - FluentGym',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to FluentGym! 🎉</h2>
          <p>Thanks for signing up. Please verify your email address to get started.</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Verify Email
          </a>
          <p>Or copy this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>This link expires in 24 hours.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    });
  }

  /**
   * Send password reset link
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: '"FluentGym" <noreply@fluentgym.com>',
      to: email,
      subject: 'Reset Your Password - FluentGym',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password 🔒</h2>
          <p>We received a request to reset your password. Click the button below to create a new password.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Reset Password
          </a>
          <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link expires in 1 hour.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    });
  }

  /**
   * Send welcome email after verification
   */
  async sendWelcomeEmail(email: string, displayName: string): Promise<void> {
    await this.transporter.sendMail({
      from: '"FluentGym" <noreply@fluentgym.com>',
      to: email,
      subject: 'Welcome to FluentGym! 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome ${displayName}! 🎉</h2>
          <p>Your email is verified and you're ready to start learning!</p>
          <p>Here's what you can do:</p>
          <ul>
            <li>📚 Browse skill packs for language, hacking, and more</li>
            <li>🎯 Get personalized daily learning plans</li>
            <li>💬 Practice with AI tutors in real-time</li>
            <li>📊 Track your progress with detailed analytics</li>
          </ul>
          <a href="${FRONTEND_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Go to Dashboard
          </a>
          <p>Happy learning! 🌟</p>
        </div>
      `,
    });
  }

  /**
   * Send daily practice reminder
   */
  async sendDailyReminder(email: string, displayName: string, dailyPlan: any): Promise<void> {
    await this.transporter.sendMail({
      from: '"FluentGym" <noreply@fluentgym.com>',
      to: email,
      subject: `${displayName}, your daily practice is ready! 📅`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Daily Plan is Ready! 📅</h2>
          <p>Hi ${displayName}, here are your recommended sessions for today:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${dailyPlan.recommendations
              .map(
                (rec: any, idx: number) => `
              <div style="margin-bottom: 15px;">
                <strong>${idx + 1}. ${rec.skillPackName}</strong>
                <p style="margin: 5px 0; color: #6b7280;">${rec.rationale}</p>
                <small style="color: #9ca3af;">⏱️ ${rec.estimatedDuration} min | ⭐ +${rec.xpPotential} XP</small>
              </div>
            `
              )
              .join('')}
          </div>
          <a href="${FRONTEND_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Start Learning
          </a>
        </div>
      `,
    });
  }
}
