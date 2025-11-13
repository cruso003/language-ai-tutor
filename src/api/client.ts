import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config/env';

class APIClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        if (!this.accessToken) {
          this.accessToken = await SecureStore.getItemAsync('accessToken');
        }

        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await this.refreshAccessToken();

            if (newAccessToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            await this.clearTokens();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
  }

  async clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken) {
      this.refreshToken = await SecureStore.getItemAsync('refreshToken');
    }

    if (!this.refreshToken) {
      return null;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken: this.refreshToken,
      });

      const { accessToken, refreshToken } = response.data;
      await this.setTokens(accessToken, refreshToken);

      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  // Auth endpoints
  async register(email: string, password: string, displayName: string) {
    const response = await this.client.post('/auth/register', {
      email,
      password,
      displayName,
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      email,
      password,
    });

    if (response.data.accessToken && response.data.refreshToken) {
      await this.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response.data;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } finally {
      await this.clearTokens();
    }
  }

  async verifyEmail(token: string) {
    const response = await this.client.get(`/auth/verify-email?token=${token}`);
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await this.client.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await this.client.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  }

  // User endpoints
  async getMe() {
    const response = await this.client.get('/api/v1/users/me');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.client.patch('/api/v1/users/me', data);
    return response.data;
  }

  // Conversation endpoints
  async sendMessage(sessionId: string, message: string, personality?: string) {
    const response = await this.client.post('/api/v1/conversation', {
      sessionId,
      userMessage: message,
      personality,
    });
    return response.data;
  }

  async getPersonalities() {
    const response = await this.client.get('/api/v1/personalities');
    return response.data;
  }

  // Session endpoints
  async createSession(skillPackId: string, scenarioId?: string) {
    const response = await this.client.post('/api/v1/sessions', {
      skillPackId,
      scenarioId,
    });
    return response.data;
  }

  async getSession(sessionId: string) {
    const response = await this.client.get(`/api/v1/sessions/${sessionId}`);
    return response.data;
  }

  async updateSession(sessionId: string, data: any) {
    const response = await this.client.patch(`/api/v1/sessions/${sessionId}`, data);
    return response.data;
  }

  async startSession(skillPackId: string, scenarioId?: string, personality?: string) {
    const response = await this.client.post('/api/v1/sessions/start', {
      skillPackId,
      scenarioId,
      personality,
    });
    return response.data;
  }

  // Speech endpoints
  async transcribeAudio(audioUri: string) {
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);

    const response = await this.client.post('/api/v1/speech/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getVoices() {
    const response = await this.client.get('/api/v1/speech/voices');
    return response.data;
  }

  async synthesizeSpeech(text: string, voice?: string) {
    const response = await this.client.get('/api/v1/speech/synthesize', {
      params: { text, voice },
      responseType: 'arraybuffer',
    });
    return response.data;
  }

  // Memory endpoints
  async saveMemory(sessionId: string, summary: string, tags: string[]) {
    const response = await this.client.post('/api/v1/memories', {
      sessionId,
      summary,
      tags,
    });
    return response.data;
  }

  async searchMemories(query: string, limit = 10) {
    const response = await this.client.post('/api/v1/memories/search', {
      query,
      limit,
    });
    return response.data;
  }

  async getRecentMemories(limit = 20) {
    const response = await this.client.get('/api/v1/memories/recent', {
      params: { limit },
    });
    return response.data;
  }

  // Skill Pack endpoints
  async getSkillPacks() {
    const response = await this.client.get('/api/v1/skill-packs');
    return response.data;
  }

  async getSkillPack(id: string) {
    const response = await this.client.get(`/api/v1/skill-packs/${id}`);
    return response.data;
  }

  // Progress endpoints
  async getProgress(userId: string) {
    const response = await this.client.get(`/api/v1/progress/${userId}`);
    return response.data;
  }

  // Marketplace endpoints
  async getMarketplacePacks() {
    const response = await this.client.get('/api/v1/marketplace/packs');
    return response.data;
  }

  async getMarketplacePack(id: string) {
    const response = await this.client.get(`/api/v1/marketplace/packs/${id}`);
    return response.data;
  }

  async purchasePack(packId: string) {
    const response = await this.client.post('/api/v1/marketplace/purchase', {
      packId,
    });
    return response.data;
  }

  async addReview(packId: string, rating: number, review: string) {
    const response = await this.client.post('/api/v1/marketplace/reviews', {
      packId,
      rating,
      review,
    });
    return response.data;
  }

  // Daily Plan endpoints
  async getDailyPlan() {
    const response = await this.client.get('/api/v1/daily-plan');
    return response.data;
  }

  // LiveKit endpoints
  async getLiveKitToken(roomName: string, participantName: string) {
    const response = await this.client.post('/api/v1/livekit/token', {
      roomName,
      participantName,
    });
    return response.data;
  }

  async createLiveKitRoom(sessionId: string) {
    const response = await this.client.post('/api/v1/livekit/rooms', {
      sessionId,
    });
    return response.data;
  }

  async endLiveKitRoom(roomName: string) {
    const response = await this.client.post('/api/v1/livekit/rooms/end', {
      roomName,
    });
    return response.data;
  }

  // Avatar endpoints
  async getAvatar() {
    const response = await this.client.get('/api/v1/avatars/me');
    return response.data;
  }

  async saveAvatar(avatarUrl: string) {
    const response = await this.client.post('/api/v1/avatars/save', {
      avatarUrl,
    });
    return response.data;
  }

  async customizeAvatar(config: any) {
    const response = await this.client.post('/api/v1/avatars/customize', config);
    return response.data;
  }

  async getAvatarCreationUrl() {
    const response = await this.client.get('/api/v1/avatars/create-url');
    return response.data;
  }
}

export const apiClient = new APIClient();
export default apiClient;
