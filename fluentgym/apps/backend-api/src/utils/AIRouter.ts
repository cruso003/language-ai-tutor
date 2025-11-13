/**
 * AI Router - Intelligent model selection based on cost, latency, and reliability
 * Phase 1: Multi-provider orchestration for FluentGym
 * 
 * Supports:
 * - OpenAI (GPT-4, GPT-3.5-turbo)
 * - Google Gemini (1.5 Pro, 1.5 Flash)
 * - Anthropic Claude (coming soon)
 * 
 * Selection criteria:
 * 1. Provider health (circuit breaker pattern)
 * 2. Cost optimization (cheaper models for simple tasks)
 * 3. Latency requirements (fast models for real-time)
 * 4. Quality needs (advanced models for complex reasoning)
 */

import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

// Types
export interface AIProvider {
  name: 'openai' | 'gemini' | 'anthropic';
  model: string;
  costPer1kTokens: number; // USD
  avgLatencyMs: number;
  maxTokens: number;
  healthStatus: 'healthy' | 'degraded' | 'down';
  lastHealthCheck: Date;
  failureCount: number;
}

export interface RouteRequest {
  task: 'conversation' | 'daily-plan' | 'feedback' | 'difficulty-assessment';
  priority: 'cost' | 'speed' | 'quality';
  maxLatencyMs?: number;
  maxCostPer1kTokens?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  content: string;
  provider: string;
  model: string;
  tokensUsed: number;
  latencyMs: number;
  cost: number;
}

// Provider configurations
const PROVIDERS: AIProvider[] = [
  {
    name: 'openai',
    model: 'gpt-4-turbo',
    costPer1kTokens: 0.01,
    avgLatencyMs: 1200,
    maxTokens: 128000,
    healthStatus: 'healthy',
    lastHealthCheck: new Date(),
    failureCount: 0,
  },
  {
    name: 'openai',
    model: 'gpt-3.5-turbo',
    costPer1kTokens: 0.0005,
    avgLatencyMs: 600,
    maxTokens: 16385,
    healthStatus: 'healthy',
    lastHealthCheck: new Date(),
    failureCount: 0,
  },
  {
    name: 'gemini',
    model: 'gemini-1.5-pro',
    costPer1kTokens: 0.00125,
    avgLatencyMs: 800,
    maxTokens: 2097152,
    healthStatus: 'healthy',
    lastHealthCheck: new Date(),
    failureCount: 0,
  },
  {
    name: 'gemini',
    model: 'gemini-1.5-flash',
    costPer1kTokens: 0.000075,
    avgLatencyMs: 400,
    maxTokens: 1048576,
    healthStatus: 'healthy',
    lastHealthCheck: new Date(),
    failureCount: 0,
  },
];

// Circuit breaker thresholds
const MAX_FAILURES = 3;
const HEALTH_CHECK_INTERVAL_MS = 60000; // 1 minute
const FAILURE_RESET_TIME_MS = 300000; // 5 minutes

export class AIRouter {
  private providers: Map<string, AIProvider>;
  private openaiClient?: OpenAI;
  private geminiClient?: GoogleGenAI;

  constructor(
    private openaiApiKey?: string,
    private geminiApiKey?: string,
  ) {
    this.providers = new Map();
    PROVIDERS.forEach((p) => {
      const key = `${p.name}:${p.model}`;
      this.providers.set(key, { ...p });
    });

    if (openaiApiKey) {
      this.openaiClient = new OpenAI({ apiKey: openaiApiKey });
    }
    if (geminiApiKey) {
      this.geminiClient = new GoogleGenAI({ apiKey: geminiApiKey });
    }
  }

  /**
   * Route a chat request to the best available provider
   */
  async routeChat(
    messages: ChatMessage[],
    request: RouteRequest,
  ): Promise<ChatResponse> {
    const provider = this.selectProvider(request);

    if (!provider) {
      throw new Error('No healthy providers available for routing');
    }

    const startTime = Date.now();

    try {
      let response: ChatResponse;

      if (provider.name === 'openai') {
        response = await this.callOpenAI(provider, messages);
      } else if (provider.name === 'gemini') {
        response = await this.callGemini(provider, messages);
      } else {
        throw new Error(`Unsupported provider: ${provider.name}`);
      }

      // Update health status on success
      this.markProviderHealthy(provider);

      return {
        ...response,
        latencyMs: Date.now() - startTime,
      };
    } catch (error) {
      // Mark provider as degraded/down
      this.markProviderFailure(provider);

      // Retry with fallback provider
      console.error(`Provider ${provider.name}:${provider.model} failed:`, error);
      const fallback = this.selectProvider({ ...request, priority: 'speed' });

      if (!fallback || fallback === provider) {
        throw new Error(
          `No fallback provider available. Original error: ${error}`,
        );
      }

      console.log(`Retrying with fallback: ${fallback.name}:${fallback.model}`);
      return this.routeChat(messages, request); // Recursive retry
    }
  }

  /**
   * Select best provider based on routing criteria
   */
  private selectProvider(request: RouteRequest): AIProvider | null {
    const healthyProviders = Array.from(this.providers.values()).filter(
      (p) => p.healthStatus !== 'down',
    );

    if (healthyProviders.length === 0) {
      return null;
    }

    // Apply filters
    let candidates = healthyProviders;

    if (request.maxLatencyMs) {
      candidates = candidates.filter((p) => p.avgLatencyMs <= request.maxLatencyMs!);
    }

    if (request.maxCostPer1kTokens) {
      candidates = candidates.filter(
        (p) => p.costPer1kTokens <= request.maxCostPer1kTokens!,
      );
    }

    if (candidates.length === 0) {
      // Relax constraints if no candidates
      candidates = healthyProviders;
    }

    // Sort by priority
    if (request.priority === 'cost') {
      candidates.sort((a, b) => a.costPer1kTokens - b.costPer1kTokens);
    } else if (request.priority === 'speed') {
      candidates.sort((a, b) => a.avgLatencyMs - b.avgLatencyMs);
    } else if (request.priority === 'quality') {
      // Prefer GPT-4 > Gemini Pro > GPT-3.5 > Gemini Flash
      const qualityScore = (p: AIProvider) => {
        if (p.model === 'gpt-4-turbo') return 4;
        if (p.model === 'gemini-1.5-pro') return 3;
        if (p.model === 'gpt-3.5-turbo') return 2;
        if (p.model === 'gemini-1.5-flash') return 1;
        return 0;
      };
      candidates.sort((a, b) => qualityScore(b) - qualityScore(a));
    }

    // Prefer healthy over degraded
    candidates.sort((a, b) => {
      if (a.healthStatus === 'healthy' && b.healthStatus === 'degraded') return -1;
      if (a.healthStatus === 'degraded' && b.healthStatus === 'healthy') return 1;
      return 0;
    });

    return candidates[0] || null;
  }

  /**
   * Call OpenAI chat completion
   */
  private async callOpenAI(
    provider: AIProvider,
    messages: ChatMessage[],
  ): Promise<ChatResponse> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized (missing API key)');
    }

    const response = await this.openaiClient.chat.completions.create({
      model: provider.model,
      messages,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '';
    const tokensUsed = response.usage?.total_tokens || 0;
    const cost = (tokensUsed / 1000) * provider.costPer1kTokens;

    return {
      content,
      provider: provider.name,
      model: provider.model,
      tokensUsed,
      latencyMs: 0, // Set by caller
      cost,
    };
  }

  /**
   * Call Google Gemini chat completion
   */
  private async callGemini(
    provider: AIProvider,
    messages: ChatMessage[],
  ): Promise<ChatResponse> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized (missing API key)');
    }

    // Build a simple prompt string from the message history
    const prompt = messages
      .map((msg) => {
        const role = msg.role === 'assistant' ? 'Assistant' : msg.role === 'system' ? 'System' : 'User';
        return `${role}: ${msg.content}`;
      })
      .join('\n\n');

    const response = await this.geminiClient.models.generateContent({
      model: provider.model,
      contents: prompt,
    });

    const content = (response as any)?.text ?? '';

    // Gemini doesn't provide token counts easily, estimate (approx 4 chars per token)
    const tokensUsed = Math.ceil((content.length + prompt.length) / 4);
    const cost = (tokensUsed / 1000) * provider.costPer1kTokens;

    return {
      content,
      provider: provider.name,
      model: provider.model,
      tokensUsed,
      latencyMs: 0,
      cost,
    };
  }

  /**
   * Mark provider as healthy
   */
  private markProviderHealthy(provider: AIProvider): void {
    const key = `${provider.name}:${provider.model}`;
    const p = this.providers.get(key);
    if (p) {
      p.healthStatus = 'healthy';
      p.failureCount = 0;
      p.lastHealthCheck = new Date();
    }
  }

  /**
   * Mark provider failure (circuit breaker)
   */
  private markProviderFailure(provider: AIProvider): void {
    const key = `${provider.name}:${provider.model}`;
    const p = this.providers.get(key);
    if (p) {
      p.failureCount++;
      p.lastHealthCheck = new Date();

      if (p.failureCount >= MAX_FAILURES) {
        p.healthStatus = 'down';
        console.warn(`Provider ${key} marked as DOWN (${p.failureCount} failures)`);

        // Auto-recover after reset time
        setTimeout(() => {
          console.log(`Attempting to recover provider ${key}`);
          p.healthStatus = 'degraded';
          p.failureCount = Math.floor(MAX_FAILURES / 2);
        }, FAILURE_RESET_TIME_MS);
      } else {
        p.healthStatus = 'degraded';
      }
    }
  }

  /**
   * Get provider health status
   */
  getProviderHealth(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Force health check for all providers
   */
  async performHealthChecks(): Promise<void> {
    const checks = Array.from(this.providers.values()).map(async (provider) => {
      try {
        await this.routeChat(
          [{ role: 'user', content: 'Health check' }],
          { task: 'conversation', priority: 'speed' },
        );
        this.markProviderHealthy(provider);
      } catch (error) {
        this.markProviderFailure(provider);
      }
    });

    await Promise.allSettled(checks);
  }
}

// Singleton instance
let routerInstance: AIRouter | null = null;

export function getAIRouter(): AIRouter {
  if (!routerInstance) {
    routerInstance = new AIRouter(
      process.env.OPENAI_API_KEY,
      process.env.GEMINI_API_KEY,
    );
  }
  return routerInstance;
}
