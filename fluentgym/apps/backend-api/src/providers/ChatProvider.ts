export type ChatProviderId = 'openai' | 'gemini';

export interface ChatUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface GenerateReplyParams {
  model?: string;
  systemPrompt: string;
  userMessage: string;
}

export interface GenerateReplyResult {
  reply: string;
  usage?: ChatUsage;
}

export interface ChatProvider {
  id: ChatProviderId;
  generateReply(params: GenerateReplyParams): Promise<GenerateReplyResult>;
}
