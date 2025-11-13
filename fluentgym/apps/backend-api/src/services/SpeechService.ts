/**
 * Speech Service - Speech-to-Text and Text-to-Speech
 * Features: Whisper transcription (OpenAI), OpenAI TTS only, pronunciation analysis
 * NOTE: Simplified to use ONLY OpenAI (and Gemini elsewhere) to reduce external API keys.
 */

import OpenAI from 'openai';
import { createWriteStream, createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { db } from '../db/index.js';
import { speechTranscriptions, pronunciationAnalyses } from '../db/schema.js';
import path from 'path';
import crypto from 'crypto';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export interface TranscribeInput {
  audioFile: Buffer | string; // Buffer or file path
  language?: string;
  userId?: string;
  sessionId?: string;
}

export interface SynthesizeInput {
  text: string;
  voice?: string; // OpenAI voice id
  language?: string;
  speed?: number;
}

export interface PronunciationInput {
  audioFile: Buffer | string;
  expectedText: string;
  language: string;
  userId?: string;
  sessionId?: string;
}

export class SpeechService {
  /**
   * Transcribe audio using OpenAI Whisper
   */
  async transcribe(input: TranscribeInput): Promise<{
    transcript: string;
    confidence: number;
    language: string;
    duration: number;
  }> {
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    const { audioFile, language, userId, sessionId } = input;

    let filePath: string;

    // Handle Buffer input
    if (Buffer.isBuffer(audioFile)) {
      const tempFileName = `temp_${crypto.randomBytes(16).toString('hex')}.webm`;
      filePath = path.join('/tmp', tempFileName);
      await pipeline(
        async function* () {
          yield audioFile;
        },
        createWriteStream(filePath)
      );
    } else {
      filePath = audioFile;
    }

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(filePath) as any,
      model: 'whisper-1',
      language: language || 'en',
      response_format: 'verbose_json',
    });

    // Save to database
    if (userId && sessionId) {
      await db.insert(speechTranscriptions).values({
        userId,
        sessionId,
        audioUrl: filePath,
        transcript: transcription.text,
        confidence: Math.round((transcription as any).avg_logprob * 100) || 85,
        language: transcription.language || language || 'en',
        duration: Math.round((transcription as any).duration || 0),
      });
    }

    return {
      transcript: transcription.text,
      confidence: Math.round((transcription as any).avg_logprob * 100) || 85,
      language: transcription.language || language || 'en',
      duration: Math.round((transcription as any).duration || 0),
    };
  }

  /**
   * Text-to-Speech using OpenAI only (single provider)
   */
  async synthesize(input: SynthesizeInput): Promise<Buffer> {
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    const { text, voice = 'alloy', speed = 1.0 } = input;
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice as any,
      input: text,
      speed,
    });
    return Buffer.from(await response.arrayBuffer());
  }

  /**
   * List available OpenAI voices (single provider).
   */
  async listVoices(): Promise<any[]> {
    return [
      { id: 'alloy', name: 'Alloy', provider: 'openai' },
      { id: 'echo', name: 'Echo', provider: 'openai' },
      { id: 'fable', name: 'Fable', provider: 'openai' },
      { id: 'onyx', name: 'Onyx', provider: 'openai' },
      { id: 'nova', name: 'Nova', provider: 'openai' },
      { id: 'shimmer', name: 'Shimmer', provider: 'openai' }
    ];
  }

  /**
   * Analyze pronunciation
   */
  async analyzePronunciation(input: PronunciationInput): Promise<{
    accuracyScore: number;
    fluencyScore: number;
    feedback: string;
    phonemes: any[];
  }> {
    const { audioFile, expectedText, language, userId, sessionId } = input;

    // First transcribe
    const { transcript } = await this.transcribe({
      audioFile,
      language,
      userId,
      sessionId,
    });

    // Compare transcription with expected text
    const accuracyScore = this.calculateAccuracy(transcript, expectedText);

    // Analyze phonemes (simplified - in production use specialized API)
    const phonemes = this.analyzePhonemes(transcript, expectedText);

    // Calculate fluency score (based on pauses, hesitations)
    const fluencyScore = this.calculateFluency(transcript);

    // Generate feedback
    const feedback = this.generateFeedback(accuracyScore, fluencyScore, phonemes);

    // Save analysis
    if (userId && sessionId) {
      await db.insert(pronunciationAnalyses).values({
        userId,
        sessionId,
        word: expectedText,
        phonemes,
        accuracyScore,
        fluencyScore,
        prosodyScore: 75, // Placeholder
        feedback,
      });
    }

    return {
      accuracyScore,
      fluencyScore,
      feedback,
      phonemes,
    };
  }

  /**
   * Calculate word accuracy (Levenshtein distance)
   */
  private calculateAccuracy(transcript: string, expected: string): number {
    const dist = this.levenshteinDistance(
      transcript.toLowerCase(),
      expected.toLowerCase()
    );
    const maxLen = Math.max(transcript.length, expected.length);
    return Math.round(((maxLen - dist) / maxLen) * 100);
  }

  /**
   * Levenshtein distance algorithm
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Analyze phonemes (simplified)
   */
  private analyzePhonemes(transcript: string, expected: string): any[] {
    const transcriptWords = transcript.toLowerCase().split(' ');
    const expectedWords = expected.toLowerCase().split(' ');

    return expectedWords.map((word, idx) => ({
      word,
      spoken: transcriptWords[idx] || '',
      correct: word === transcriptWords[idx],
      confidence: word === transcriptWords[idx] ? 100 : 50,
    }));
  }

  /**
   * Calculate fluency score
   */
  private calculateFluency(transcript: string): number {
    // Count filler words
    const fillers = ['um', 'uh', 'like', 'you know'];
    let fillerCount = 0;

    fillers.forEach((filler) => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      fillerCount += (transcript.match(regex) || []).length;
    });

    // Penalize for fillers
    const wordsCount = transcript.split(' ').length;
    const fillerPenalty = (fillerCount / wordsCount) * 100;

    return Math.max(0, 100 - fillerPenalty);
  }

  /**
   * Generate feedback based on scores
   */
  private generateFeedback(accuracy: number, fluency: number, phonemes: any[]): string {
    let feedback = '';

    if (accuracy >= 90) {
      feedback += 'Excellent pronunciation! ';
    } else if (accuracy >= 70) {
      feedback += 'Good pronunciation with minor errors. ';
    } else {
      feedback += 'Pronunciation needs improvement. ';
    }

    if (fluency >= 90) {
      feedback += 'Very fluent delivery!';
    } else if (fluency >= 70) {
      feedback += 'Good fluency, but try to reduce hesitations.';
    } else {
      feedback += 'Focus on smoother delivery with fewer pauses.';
    }

    // Add specific word corrections
    const incorrectWords = phonemes.filter((p) => !p.correct);
    if (incorrectWords.length > 0) {
      feedback += ` Pay attention to: ${incorrectWords.map((w) => w.word).join(', ')}.`;
    }

    return feedback;
  }
}
