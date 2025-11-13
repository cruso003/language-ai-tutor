/**
 * Avatar Service - 3D Avatar management with Ready Player Me
 * Features: Avatar creation, customization, animation data
 */

import { db } from '../db/index.js';
import { userProfiles } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const READY_PLAYER_ME_SUBDOMAIN = process.env.READY_PLAYER_ME_SUBDOMAIN || 'fluentgym';

export interface CreateAvatarInput {
  userId: string;
}

export interface SaveAvatarInput {
  userId: string;
  glbUrl: string;
  config?: any;
}

export interface CustomizeAvatarInput {
  userId: string;
  customization: {
    skinColor?: string;
    hairStyle?: string;
    hairColor?: string;
    eyeColor?: string;
    outfit?: string;
    accessories?: string[];
  };
}

export class AvatarService {
  /**
   * Get Ready Player Me avatar creation URL
   */
  getAvatarCreationUrl(userId: string): string {
    const baseUrl = `https://${READY_PLAYER_ME_SUBDOMAIN}.readyplayer.me/avatar`;
    const callbackUrl = `${process.env.FRONTEND_URL}/avatar/callback`;
    
    return `${baseUrl}?frameApi&clearCache&userId=${userId}&returnUrl=${encodeURIComponent(callbackUrl)}`;
  }

  /**
   * Save avatar GLB URL to user profile
   */
  async saveAvatar(input: SaveAvatarInput): Promise<{ message: string; avatarUrl: string }> {
    const { userId, glbUrl, config } = input;

    // Validate GLB URL
    if (!glbUrl.includes('.glb')) {
      throw new Error('Invalid GLB URL');
    }

    // Update user profile
    await db
      .update(userProfiles)
      .set({
        avatarGlbUrl: glbUrl,
        avatarConfig: config || {},
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId));

    return {
      message: 'Avatar saved successfully',
      avatarUrl: glbUrl,
    };
  }

  /**
   * Get user's avatar
   */
  async getAvatar(userId: string): Promise<{
    avatarUrl: string | null;
    config: any;
  }> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (!profile) {
      throw new Error('User profile not found');
    }

    return {
      avatarUrl: profile.avatarGlbUrl || null,
      config: profile.avatarConfig || {},
    };
  }

  /**
   * Customize avatar (update config)
   */
  async customizeAvatar(input: CustomizeAvatarInput): Promise<{ message: string }> {
    const { userId, customization } = input;

    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (!profile) {
      throw new Error('User profile not found');
    }

    const updatedConfig = {
      ...(profile.avatarConfig as any),
      ...customization,
    };

    await db
      .update(userProfiles)
      .set({
        avatarConfig: updatedConfig,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId));

    return { message: 'Avatar customized successfully' };
  }

  /**
   * Get avatar animations (lip-sync, idle, emotions)
   */
  getAnimations(): any[] {
    return [
      {
        id: 'idle',
        name: 'Idle',
        description: 'Default idle animation',
        url: '/animations/idle.fbx',
      },
      {
        id: 'talking',
        name: 'Talking',
        description: 'Lip-sync animation for speech',
        url: '/animations/talking.fbx',
      },
      {
        id: 'happy',
        name: 'Happy',
        description: 'Happy expression',
        url: '/animations/happy.fbx',
      },
      {
        id: 'confused',
        name: 'Confused',
        description: 'Confused expression',
        url: '/animations/confused.fbx',
      },
      {
        id: 'encouraging',
        name: 'Encouraging',
        description: 'Encouraging gesture',
        url: '/animations/encouraging.fbx',
      },
    ];
  }

  /**
   * Generate lip-sync data from text (using TTS)
   */
  async generateLipSync(text: string, duration: number): Promise<{
    visemes: any[];
    duration: number;
  }> {
    // Simplified viseme generation
    // In production, use Azure Speech SDK or Oculus OVR Lip Sync
    
    const words = text.split(' ');
    const timePerWord = duration / words.length;
    
    const visemes = words.map((word, idx) => ({
      time: idx * timePerWord,
      viseme: this.getVisemeForWord(word),
      duration: timePerWord,
    }));

    return {
      visemes,
      duration,
    };
  }

  /**
   * Get viseme for word (simplified)
   */
  private getVisemeForWord(word: string): string {
    // Map to basic viseme shapes
    const firstChar = word[0]?.toLowerCase();
    
    const visemeMap: any = {
      'a': 'aa',
      'e': 'E',
      'i': 'I',
      'o': 'O',
      'u': 'U',
      'b': 'PP',
      'p': 'PP',
      'm': 'PP',
      'f': 'FF',
      'v': 'FF',
      'th': 'TH',
      's': 'SS',
      'z': 'SS',
      'r': 'RR',
      'l': 'RR',
    };

    return visemeMap[firstChar] || 'sil'; // silence
  }

  /**
   * Delete avatar
   */
  async deleteAvatar(userId: string): Promise<{ message: string }> {
    await db
      .update(userProfiles)
      .set({
        avatarGlbUrl: null,
        avatarConfig: null,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId));

    return { message: 'Avatar deleted successfully' };
  }
}
