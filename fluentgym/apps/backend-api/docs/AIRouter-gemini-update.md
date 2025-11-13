# AIRouter.ts Gemini Update

Replace the old `@google/generative-ai` with the new `@google/genai` SDK:

## Line 18 - Import statement:
```typescript
// OLD:
import { GoogleGenerativeAI } from '@google/generative-ai';

// NEW:
import { GoogleGenAI } from '@google/genai';
```

## Line 105 - Client type:
```typescript
// OLD:
private geminiClient?: GoogleGenerativeAI;

// NEW:
private geminiClient?: GoogleGenAI;
```

## Line 121 - Client initialization:
```typescript
// OLD:
this.geminiClient = new GoogleGenerativeAI(geminiApiKey);

// NEW:
this.geminiClient = new GoogleGenAI({ apiKey: geminiApiKey });
```

## Lines 272-295 - callGemini method:
```typescript
// OLD:
private async callGemini(
  provider: AIProvider,
  messages: ChatMessage[],
): Promise<ChatResponse> {
  if (!this.geminiClient) {
    throw new Error('Gemini client not initialized (missing API key)');
  }

  const model = this.geminiClient.getGenerativeModel({ model: provider.model });

  // Convert messages to Gemini format
  const history = messages.slice(0, -1).map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const lastMessage = messages[messages.length - 1]?.content || '';

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage);
  const content = result.response.text();

  // Gemini doesn't provide token counts easily, estimate
  const tokensUsed = Math.ceil((content.length + lastMessage.length) / 4);
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

// NEW:
private async callGemini(
  provider: AIProvider,
  messages: ChatMessage[],
): Promise<ChatResponse> {
  if (!this.geminiClient) {
    throw new Error('Gemini client not initialized (missing API key)');
  }

  // Convert messages to prompt string (new SDK uses simpler format)
  const prompt = messages.map((msg) => {
    const role = msg.role === 'assistant' ? 'Model' : msg.role === 'system' ? 'System' : 'User';
    return `${role}: ${msg.content}`;
  }).join('\n\n');

  const response = await this.geminiClient.models.generateContent({
    model: provider.model,
    contents: prompt
  });

  const content = response.text || '';

  // Estimate token usage (4 chars ≈ 1 token)
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
```
