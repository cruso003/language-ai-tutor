import OpenAI from "openai";
import {
  ConversationMessage,
  ScenarioMission,
  AIPersonality,
  GrammarCorrection,
  LanguageCode,
  ProficiencyLevel,
} from "../types";

export class AIConversationService {
  private openai: OpenAI;
  private conversationHistory: ConversationMessage[] = [];
  private currentScenario?: ScenarioMission;
  private aiPersonality?: AIPersonality;
  private targetLanguage: LanguageCode;
  private nativeLanguage: LanguageCode;
  private proficiencyLevel: ProficiencyLevel;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // For development - move to backend in production
    });
    this.targetLanguage = "es" as LanguageCode;
    this.nativeLanguage = "en" as LanguageCode;
    this.proficiencyLevel = "beginner" as ProficiencyLevel;
  }

  setLanguageSettings(
    targetLanguage: LanguageCode,
    nativeLanguage: LanguageCode,
    proficiencyLevel: ProficiencyLevel
  ) {
    this.targetLanguage = targetLanguage;
    this.nativeLanguage = nativeLanguage;
    this.proficiencyLevel = proficiencyLevel;
  }

  startScenario(scenario: ScenarioMission, personality: AIPersonality) {
    this.currentScenario = scenario;
    this.aiPersonality = personality;
    this.conversationHistory = [];
  }

  private buildSystemPrompt(): string {
    const languageNames = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ja: "Japanese",
      ko: "Korean",
      zh: "Chinese",
      ar: "Arabic",
      ru: "Russian",
    } as const;

    const targetLang =
      languageNames[this.targetLanguage] || "the target language";
    const nativeLang = languageNames[this.nativeLanguage] || "English";

    return `You are ${this.aiPersonality?.name}, a ${
      this.aiPersonality?.personality
    } language tutor helping someone learn ${targetLang}.

SCENARIO: ${this.currentScenario?.title}
${this.currentScenario?.description}

STUDENT LEVEL: ${this.proficiencyLevel}
OBJECTIVES: ${this.currentScenario?.objectives.join(", ")}

YOUR ROLE:
- You are playing a character in this scenario (e.g., if it's a café scenario, you're the barista)
- Speak ONLY in ${targetLang} - immerse the student completely
- Adjust complexity based on their ${this.proficiencyLevel} level
- Respond naturally as the character would in real life
- Speaking speed: ${this.aiPersonality?.speakingSpeed}
- Personality: ${this.aiPersonality?.description}

CRITICAL RULES:
1. NO ENGLISH unless the student is completely stuck (they can ask "help" in English)
2. If they make an error, respond naturally but work the correct form into your response
3. Don't explicitly correct unless they ask - immersion is key
4. Push them to respond within 3-5 seconds (measure hesitation)
5. Gradually increase difficulty if they're doing well
6. If they're struggling, simplify your responses
7. Include cultural context naturally in conversation
8. End responses with a question or prompt to keep conversation flowing

PERSONALITY TRAITS:
${
  this.aiPersonality?.personality === "patient"
    ? "- Speak slowly and clearly\n- Give encouraging feedback\n- Repeat if needed"
    : ""
}
${
  this.aiPersonality?.personality === "challenging"
    ? "- Speak at normal/fast pace\n- Push for perfection\n- Use more complex vocabulary"
    : ""
}
${
  this.aiPersonality?.personality === "friendly"
    ? "- Use casual language\n- Be warm and supportive\n- Make jokes when appropriate"
    : ""
}
${
  this.aiPersonality?.personality === "formal"
    ? "- Use formal register\n- Professional tone\n- Precise language"
    : ""
}

Remember: You're training them for REAL conversations. Make it realistic, make mistakes natural, and keep them speaking!`;
  }

  async sendMessage(userMessage: string): Promise<{
    response: string;
    corrections: GrammarCorrection[];
    shouldEndSession: boolean;
  }> {
    // Add user message to history
    this.conversationHistory.push({
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    });

    try {
      // Build messages for GPT-4
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: this.buildSystemPrompt() },
        ...this.conversationHistory.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ];

      // Call GPT-4 for conversation response
      const conversationResponse = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages,
        temperature: 0.8,
        max_tokens: 200,
      });

      const aiResponse = conversationResponse.choices[0].message.content || "";

      // Add AI response to history
      this.conversationHistory.push({
        id: Date.now().toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      });

      // Analyze for corrections (in parallel)
      const corrections = await this.analyzeForCorrections(userMessage);

      // Check if scenario objectives are met
      const shouldEndSession = await this.checkObjectivesCompleted();

      return {
        response: aiResponse,
        corrections,
        shouldEndSession,
      };
    } catch (error) {
      console.error("AI Conversation Error:", error);
      throw new Error("Failed to get AI response");
    }
  }

  private async analyzeForCorrections(
    userMessage: string
  ): Promise<GrammarCorrection[]> {
    try {
      const correctionPrompt = `Analyze this ${this.targetLanguage} message from a ${this.proficiencyLevel} learner: "${userMessage}"

Identify ONLY significant errors (grammar, vocabulary, syntax). Don't be overly pedantic.

Return a JSON array of corrections in this format:
[
  {
    "original": "the incorrect phrase",
    "corrected": "the correct phrase",
    "explanation": "brief explanation in English",
    "errorType": "grammar" | "vocabulary" | "syntax" | "idiom"
  }
]

If there are no significant errors, return an empty array [].`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: correctionPrompt }],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(
        response.choices[0].message.content || '{"corrections":[]}'
      );
      return result.corrections || [];
    } catch (error) {
      console.error("Error analyzing corrections:", error);
      return [];
    }
  }

  private async checkObjectivesCompleted(): Promise<boolean> {
    if (!this.currentScenario || this.conversationHistory.length < 6) {
      return false;
    }

    try {
      const evaluationPrompt = `Review this conversation for the scenario: "${
        this.currentScenario.title
      }"

OBJECTIVES:
${this.currentScenario.objectives
  .map((obj, i) => `${i + 1}. ${obj}`)
  .join("\n")}

CONVERSATION:
${this.conversationHistory
  .slice(-10)
  .map((msg) => `${msg.role}: ${msg.content}`)
  .join("\n")}

Has the student successfully completed ALL objectives? Consider:
- Did they demonstrate the required language functions?
- Was the conversation natural and goal-oriented?
- Did they achieve the scenario's purpose?

Respond with JSON: {"completed": true/false, "reason": "brief explanation"}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: evaluationPrompt }],
        temperature: 0.2,
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(
        response.choices[0].message.content || '{"completed":false}'
      );
      return result.completed || false;
    } catch (error) {
      console.error("Error checking objectives:", error);
      return false;
    }
  }

  async generateFinalFeedback(): Promise<{
    fluencyScore: number;
    strengths: string[];
    improvements: string[];
    vocabularyUsed: number;
    nextSteps: string[];
  }> {
    const feedbackPrompt = `Analyze this language learning session:

STUDENT LEVEL: ${this.proficiencyLevel}
SCENARIO: ${this.currentScenario?.title}

CONVERSATION:
${this.conversationHistory
  .map((msg) => `${msg.role}: ${msg.content}`)
  .join("\n")}

Provide detailed feedback in JSON format:
{
  "fluencyScore": 0-100,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["area 1", "area 2", "area 3"],
  "vocabularyUsed": number of unique words used,
  "nextSteps": ["recommendation 1", "recommendation 2"]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: feedbackPrompt }],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Error generating feedback:", error);
      return {
        fluencyScore: 50,
        strengths: ["Completed the conversation"],
        improvements: ["Continue practicing"],
        vocabularyUsed: 0,
        nextSteps: ["Try another scenario"],
      };
    }
  }

  getConversationHistory(): ConversationMessage[] {
    return this.conversationHistory;
  }

  resetConversation() {
    this.conversationHistory = [];
    this.currentScenario = undefined;
  }
}

export default AIConversationService;
