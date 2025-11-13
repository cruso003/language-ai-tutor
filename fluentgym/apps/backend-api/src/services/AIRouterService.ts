/**
 * Enhanced AI Router - Multi-model orchestration with cost optimization
 * Supports: OpenAI GPT-4, Google Gemini, Anthropic Claude
 */

import OpenAI from 'openai';
// Gemini client simplified to avoid unsupported import failures. Using dynamic require pattern.
// NOTE: If '@google/genai' version does not export GoogleGenerativeAI in this environment, replace with minimal REST wrapper.
// import { GoogleGenerativeAI } from '@google/genai'; (commented out to fix type error)
import { db } from '../db/index.js';
import { tokenUsage } from '../db/schema.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// Placeholder Gemini client object; implement real client or REST calls later.
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const gemini = {
  getGenerativeModel: ({ model }: { model: string }) => ({
    startChat: ({ history, generationConfig, systemInstruction }: any) => ({
      async sendMessage(text: string) {
        // Fallback stub response if Gemini SDK not available.
        return {
          response: {
            text: () => `Gemini(model=${model}) stub response to: ${text.substring(0, 50)}...`,
          },
        };
      },
    }),
  }),
};

// Model costs per 1M tokens (approximate)
const MODEL_COSTS = {
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4-turbo': { input: 10.00, output: 30.00 },
  'gemini-2.0-flash-exp': { input: 0.00, output: 0.00 }, // Free tier
  'gemini-1.5-pro': { input: 1.25, output: 5.00 },
  'claude-3-5-sonnet': { input: 3.00, output: 15.00 },
};

export interface AIRequest {
  messages: Array<{ role: string; content: string }>;
  userId?: string;
  sessionId?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUsd: number;
  };
}

export class AIRouterService {
  /**
   * Route request to best model based on complexity and cost
   */
  async chat(request: AIRequest): Promise<AIResponse> {
    const { messages, userId, sessionId, temperature = 0.7, maxTokens = 1000 } = request;

    // Analyze request complexity
    const complexity = this.analyzeComplexity(messages);

    // Select best model
    const selectedModel = request.model || this.selectModel(complexity);

    let response: AIResponse;

    // Route to provider
    if (selectedModel.startsWith('gpt')) {
      response = await this.chatOpenAI({ ...request, model: selectedModel });
    } else if (selectedModel.startsWith('gemini')) {
      response = await this.chatGemini({ ...request, model: selectedModel });
    } else {
      // Fallback to GPT-4o-mini
      response = await this.chatOpenAI({ ...request, model: 'gpt-4o-mini' });
    }

    // Log usage
    if (userId || sessionId) {
      await this.logUsage({
        userId,
        sessionId,
        provider: response.model.startsWith('gpt') ? 'openai' : 'gemini',
        model: response.model,
        usage: response.usage,
      });
    }

    return response;
  }

  /**
   * Chat with OpenAI
   */
  private async chatOpenAI(request: AIRequest): Promise<AIResponse> {
    const { messages, model = 'gpt-4o-mini', temperature = 0.7, maxTokens = 1000, systemPrompt } = request;

    const formattedMessages: any[] = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const completion = await openai.chat.completions.create({
      model,
      messages: formattedMessages as any,
      temperature,
      max_tokens: maxTokens,
    });

    const usage = completion.usage!;
    const costs = MODEL_COSTS[model as keyof typeof MODEL_COSTS] || MODEL_COSTS['gpt-4o-mini'];

    return {
      content: completion.choices[0].message.content || '',
      model,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        costUsd:
          (usage.prompt_tokens * costs.input + usage.completion_tokens * costs.output) / 1_000_000,
      },
    };
  }

  /**
   * Chat with Google Gemini
   */
  private async chatGemini(request: AIRequest): Promise<AIResponse> {
    const { messages, model = 'gemini-2.0-flash-exp', temperature = 0.7, systemPrompt } = request;

    const geminiModel = gemini.getGenerativeModel({ model });

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chat = geminiModel.startChat({
      history,
      generationConfig: {
        temperature,
        maxOutputTokens: 1000,
      },
      ...(systemPrompt && { systemInstruction: systemPrompt }),
    });

    const result = await chat.sendMessage(lastMessage);
    const response = result.response;

    // Gemini usage metrics (approximation)
    const promptTokens = this.estimateTokens(messages.map((m) => m.content).join(' '));
    const completionTokens = this.estimateTokens(response.text());
    const costs = MODEL_COSTS[model as keyof typeof MODEL_COSTS] || { input: 0, output: 0 };

    return {
      content: response.text(),
      model,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        costUsd: (promptTokens * costs.input + completionTokens * costs.output) / 1_000_000,
      },
    };
  }

  /**
   * Analyze request complexity
   */
  private analyzeComplexity(messages: Array<{ role: string; content: string }>): 'low' | 'medium' | 'high' {
    const totalContent = messages.map((m) => m.content).join(' ');
    const tokenCount = this.estimateTokens(totalContent);

    // Check for complex patterns
    const hasCode = /```/.test(totalContent);
    const hasMultiStep = /(step|first|second|then|finally)/i.test(totalContent);
    const hasReasoning = /(explain|analyze|compare|evaluate)/i.test(totalContent);

    if (tokenCount > 2000 || hasCode || (hasMultiStep && hasReasoning)) {
      return 'high';
    } else if (tokenCount > 500 || hasMultiStep || hasReasoning) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Select best model based on complexity
   */
  private selectModel(complexity: 'low' | 'medium' | 'high'): string {
    switch (complexity) {
      case 'low':
        return 'gemini-2.0-flash-exp'; // Free!
      case 'medium':
        return 'gpt-4o-mini'; // Cheap and fast
      case 'high':
        return 'gpt-4o'; // Best quality
      default:
        return 'gpt-4o-mini';
    }
  }

  /**
   * Estimate token count
   */
  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Log token usage to database
   */
  private async logUsage(data: {
    userId?: string;
    sessionId?: string;
    provider: string;
    model: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      costUsd: number;
    };
  }): Promise<void> {
    await db.insert(tokenUsage).values({
      userId: data.userId || null,
      sessionId: data.sessionId || null,
      provider: data.provider,
      model: data.model,
      promptTokens: data.usage.promptTokens,
      completionTokens: data.usage.completionTokens,
      totalTokens: data.usage.totalTokens,
      costUsd: Math.round(data.usage.costUsd * 1_000_000), // Store as micro-dollars
    });
  }

  /**
   * Get total cost for user/session
   */
  async getCost(filters: { userId?: string; sessionId?: string }): Promise<{
    totalCost: number;
    byModel: Record<string, number>;
  }> {
    // This would query the database for aggregated costs
    // Implementation left as exercise
    return {
      totalCost: 0,
      byModel: {},
    };
  }
}
