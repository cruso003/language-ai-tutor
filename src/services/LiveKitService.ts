/**
 * LiveKit Service for Real-Time Audio/Video Communication
 *
 * This service handles:
 * - Real-time voice conversation
 * - Audio streaming for pronunciation analysis
 * - Video for visual pronunciation feedback
 */

import { Room, RoomEvent, Track } from '@livekit/react-native';

export class LiveKitService {
  private room: Room | null = null;
  private isConnected: boolean = false;
  private audioEnabled: boolean = true;
  private videoEnabled: boolean = false;

  constructor() {
    this.room = new Room();
  }

  async connect(url: string, token: string): Promise<void> {
    if (!this.room) {
      throw new Error('Room not initialized');
    }

    try {
      await this.room.connect(url, token, {
        audio: true,
        video: false // Start with audio only
      });

      this.isConnected = true;
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to connect to LiveKit:', error);
      throw error;
    }
  }

  private setupEventListeners() {
    if (!this.room) return;

    this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      console.log('Track subscribed:', track.kind);
      // Handle incoming audio/video tracks
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
      console.log('Track unsubscribed:', track.kind);
    });

    this.room.on(RoomEvent.Disconnected, () => {
      console.log('Disconnected from room');
      this.isConnected = false;
    });

    this.room.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log('Participant connected:', participant.identity);
    });
  }

  async enableVideo(enable: boolean): Promise<void> {
    if (!this.room) return;

    try {
      await this.room.localParticipant.setCameraEnabled(enable);
      this.videoEnabled = enable;
    } catch (error) {
      console.error('Failed to toggle video:', error);
    }
  }

  async enableAudio(enable: boolean): Promise<void> {
    if (!this.room) return;

    try {
      await this.room.localParticipant.setMicrophoneEnabled(enable);
      this.audioEnabled = enable;
    } catch (error) {
      console.error('Failed to toggle audio:', error);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.room) return;

    await this.room.disconnect();
    this.isConnected = false;
  }

  getRoom(): Room | null {
    return this.room;
  }

  isRoomConnected(): boolean {
    return this.isConnected;
  }

  isAudioEnabled(): boolean {
    return this.audioEnabled;
  }

  isVideoEnabled(): boolean {
    return this.videoEnabled;
  }
}

export default LiveKitService;
