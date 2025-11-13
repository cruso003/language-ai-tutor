// Gemini provider using the current @google/genai SDK
import { ChatProvider, GenerateReplyParams, GenerateReplyResult } from './ChatProvider';

/**
 * Gemini chat provider using official @google/genai SDK.
 * Adds: model fallback handling, minimal safety around empty responses.
 */
export class GeminiChatProvider implements ChatProvider {
  public readonly id = 'gemini' as const;
  private clientPromise: Promise<any>;
  private defaultModel: string;

  // Preferred -> fallback order
  private static FALLBACK_MODELS = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro'
  ];

  constructor(apiKey: string, defaultModel = process.env.GEMINI_DEFAULT_MODEL || 'gemini-2.0-flash-exp') {
    this.defaultModel = defaultModel;
    this.clientPromise = import('@google/genai')
      .then((mod: any) => new mod.GoogleGenAI({ apiKey }))
      .catch((_err: any) => {
        throw new Error('Gemini SDK (@google/genai) not installed. Please run: npm install @google/genai');
      });
  }

  async generateReply(params: GenerateReplyParams): Promise<GenerateReplyResult> {
    const client = await this.clientPromise;

    // Determine candidate models (requested first, then default + fallbacks unique-preserved)
    const requested = params.model ? [params.model] : [];
    const candidates = this.unique([ ...requested, this.defaultModel, ...GeminiChatProvider.FALLBACK_MODELS ]);

    const prompt = `${params.systemPrompt}\n\nUser: ${params.userMessage}`;

    let lastErr: any = null;
    for (const modelName of candidates) {
      try {
        const response = await client.models.generateContent({
          model: modelName,
          contents: prompt
        });
        
        const text = response?.text ?? '';
        if (!text.trim()) {
          lastErr = new Error(`Empty response from model ${modelName}`);
          continue; // try next model
        }
        
        return {
          reply: text,
          usage: {}, // @google/genai doesn't expose token counts directly in response
          model: modelName
        } as any;
      } catch (err: any) {
        lastErr = err;
        const status = (err && (err.status || err.code)) as number | undefined;
        const is404 = status === 404 || /404 Not Found/i.test(err?.message || '') || /not found/i.test(err?.message || '');
        
        if (!is404 && requested.length && modelName === requested[0]) {
          // For explicitly requested model with non-404 error: abort
          throw new Error(`Gemini request failed for explicit model '${modelName}': ${err?.message || err}`);
        }
        // otherwise continue to next model
      }
    }

    throw new Error(`Gemini provider failed after trying ${candidates.length} model(s). Last error: ${lastErr?.message || lastErr}`);
  }

  private unique(list: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const item of list) {
      if (!item || seen.has(item)) continue;
      seen.add(item);
      out.push(item);
    }
    return out;
  }
}
