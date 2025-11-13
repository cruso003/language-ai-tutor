/**
 * LiveKit Service - Real-time audio/video rooms
 * Features: Room creation, token generation, recording
 */

import { AccessToken, RoomServiceClient, Room } from 'livekit-server-sdk';
import { db } from '../db/index.js';
import { livekitRooms, sessionRecordings } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://localhost:7880';

export interface CreateRoomInput {
  sessionId: string;
  userId: string;
  maxParticipants?: number;
}

export interface GenerateTokenInput {
  roomName: string;
  participantName: string;
  userId: string;
  canPublish?: boolean;
  canSubscribe?: boolean;
}

export class LiveKitService {
  private roomService: RoomServiceClient;

  constructor() {
    this.roomService = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
  }

  /**
   * Create a new LiveKit room
   */
  async createRoom(input: CreateRoomInput): Promise<{ roomName: string; roomId: string }> {
    const { sessionId, userId, maxParticipants = 2 } = input;

    // Generate unique room name
    const roomName = `session_${sessionId}_${Date.now()}`;

    // Create room in LiveKit
    const room = await this.roomService.createRoom({
      name: roomName,
      emptyTimeout: 300, // 5 minutes
      maxParticipants,
    });

    // Save to database
    const [dbRoom] = await db
      .insert(livekitRooms)
      .values({
        roomName,
        sessionId,
        userId,
        maxParticipants,
        status: 'active',
      })
      .returning();

    return {
      roomName,
      roomId: dbRoom.id,
    };
  }

  /**
   * Generate access token for joining a room
   */
  async generateToken(input: GenerateTokenInput): Promise<string> {
    const { roomName, participantName, userId, canPublish = true, canSubscribe = true } = input;

    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userId,
      name: participantName,
      metadata: JSON.stringify({ userId }),
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish,
      canSubscribe,
      canPublishData: true,
    });

    return token.toJwt();
  }

  /**
   * Start recording a room
   */
  async startRecording(roomName: string, sessionId: string): Promise<{ recordingId: string }> {
    // LiveKit Cloud recording API call
    // Note: Requires LiveKit Cloud or Egress service configured

    // For now, create recording record in DB
    const [room] = await db
      .select()
      .from(livekitRooms)
      .where(eq(livekitRooms.roomName, roomName))
      .limit(1);

    if (!room) {
      throw new Error('Room not found');
    }

    const [recording] = await db
      .insert(sessionRecordings)
      .values({
        sessionId,
        roomId: room.id,
        status: 'recording',
      })
      .returning();

    // TODO: Actually start recording with LiveKit Egress
    // await this.roomService.sendData(...)

    return {
      recordingId: recording.id,
    };
  }

  /**
   * Stop recording a room
   */
  async stopRecording(recordingId: string): Promise<{ recordingUrl: string }> {
    const [recording] = await db
      .select()
      .from(sessionRecordings)
      .where(eq(sessionRecordings.id, recordingId))
      .limit(1);

    if (!recording) {
      throw new Error('Recording not found');
    }

    // TODO: Stop LiveKit recording and get URL
    const recordingUrl = `https://recordings.fluentgym.com/${recordingId}.mp4`;

    await db
      .update(sessionRecordings)
      .set({
        status: 'completed',
        recordingUrl,
        completedAt: new Date(),
      })
      .where(eq(sessionRecordings.id, recordingId));

    return { recordingUrl };
  }

  /**
   * End a room
   */
  async endRoom(roomName: string): Promise<void> {
    // Delete room from LiveKit
    await this.roomService.deleteRoom(roomName);

    // Update database
    await db
      .update(livekitRooms)
      .set({
        status: 'ended',
        endedAt: new Date(),
      })
      .where(eq(livekitRooms.roomName, roomName));
  }

  /**
   * List active rooms
   */
  async listRooms(): Promise<Room[]> {
    const rooms = await this.roomService.listRooms();
    return rooms;
  }

  /**
   * Get room info
   */
  async getRoom(roomName: string): Promise<Room | null> {
    try {
      const rooms = await this.roomService.listRooms([roomName]);
      return rooms[0] || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Remove participant from room
   */
  async removeParticipant(roomName: string, participantIdentity: string): Promise<void> {
    await this.roomService.removeParticipant(roomName, participantIdentity);
  }

  /**
   * Mute/unmute participant
   */
  async muteParticipant(roomName: string, participantIdentity: string, muted: boolean): Promise<void> {
    await this.roomService.mutePublishedTrack(roomName, participantIdentity, '', muted);
  }
}
