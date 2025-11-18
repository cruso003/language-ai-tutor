import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
        if (!this.accessToken && typeof window !== 'undefined') {
          this.accessToken = localStorage.getItem('accessToken');
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
            this.clearTokens();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken && typeof window !== 'undefined') {
      this.refreshToken = localStorage.getItem('refreshToken');
    }

    if (!this.refreshToken) {
      return null;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken: this.refreshToken,
      });

      const { accessToken, refreshToken } = response.data;
      this.setTokens(accessToken, refreshToken);

      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  // Auth endpoints
  async register(email: string, password: string, name?: string) {
    const response = await this.client.post('/auth/register', { email, password, name });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = response.data;
    this.setTokens(accessToken, refreshToken);
    return { user, accessToken, refreshToken };
  }

  async logout() {
    this.clearTokens();
  }

  async verifyEmail(token: string) {
    const response = await this.client.post('/auth/verify', { token });
    return response.data;
  }

  async resetPassword(email: string) {
    const response = await this.client.post('/auth/reset-password', { email });
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
  async sendMessage(data: {
    message: string;
    sessionId?: string;
    scenarioId?: string;
    personalityId?: string;
    targetLanguage?: string;
    nativeLanguage?: string;
  }) {
    const response = await this.client.post('/api/v1/conversation', data);
    return response.data;
  }

  // Session endpoints
  async createSession(data: {
    scenarioId: string;
    personalityId: string;
    targetLanguage?: string;
    nativeLanguage?: string;
  }) {
    const response = await this.client.post('/api/v1/sessions', data);
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

  async getSessions(params?: { limit?: number; offset?: number }) {
    const response = await this.client.get('/api/v1/sessions', { params });
    return response.data;
  }

  // Stats endpoints
  async getStats() {
    const response = await this.client.get('/api/v1/stats');
    return response.data;
  }

  // Personalities endpoints
  async getPersonalities() {
    const response = await this.client.get('/api/v1/personalities');
    return response.data;
  }
}

export const apiClient = new APIClient();
export default apiClient;
