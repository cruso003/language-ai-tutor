import OpenAI from 'openai';
import { ChatProvider, GenerateReplyParams, GenerateReplyResult } from './ChatProvider';

export class OpenAIChatProvider implements ChatProvider {
  public readonly id = 'openai' as const;
  private client: OpenAI;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel = 'gpt-4o-mini') {
    this.client = new OpenAI({ apiKey });
    this.defaultModel = defaultModel;
  }

  async generateReply(params: GenerateReplyParams): Promise<GenerateReplyResult> {
    const model = params.model || this.defaultModel;
    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userMessage }
      ]
    });

    const choice = completion.choices?.[0];
    return {
      reply: choice?.message?.content ?? '',
      usage: {
        promptTokens: completion.usage?.prompt_tokens ?? 0,
        completionTokens: completion.usage?.completion_tokens ?? 0,
        totalTokens: completion.usage?.total_tokens ?? 0
      }
    };
  }
}
