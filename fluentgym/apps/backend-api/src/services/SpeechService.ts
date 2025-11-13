/**
 * Speech Service - Speech-to-Text and Text-to-Speech
 * Features: Whisper transcription (OpenAI), OpenAI TTS only, pronunciation analysis
 * NOTE: Simplified to use ONLY OpenAI (and Gemini elsewhere) to reduce external API keys.
 */

import OpenAI from 'openai';
import { createWriteStream, createReadStream, unlinkSync, existsSync } from 'fs';
import { pipeline } from 'stream/promises';
import { db } from '../db/index.js';
import { speechTranscriptions, pronunciationAnalyses } from '../db/schema.js';
import path from 'path';
import crypto from 'crypto';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Supported audio formats for Whisper
const SUPPORTED_FORMATS = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm', 'ogg', 'flac'];

// Audio file extensions mapping
const MIME_TO_EXT: Record<string, string> = {
  'audio/webm': '.webm',
  'audio/wav': '.wav',
  'audio/mp3': '.mp3',
  'audio/mpeg': '.mp3',
  'audio/ogg': '.ogg',
  'audio/m4a': '.m4a',
  'audio/mp4': '.mp4',
  'audio/flac': '.flac',
};

export interface TranscribeInput {
  audioFile: Buffer | string; // Buffer or file path
  language?: string;
  userId?: string;
  sessionId?: string;
  mimeType?: string; // For proper file extension
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
  mimeType?: string;
}

export interface TranscribeResult {
  transcript: string;
  confidence: number;
  language: string;
  duration: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export class SpeechService {
  /**
   * Transcribe audio using OpenAI Whisper with enhanced file handling
   */
  async transcribe(input: TranscribeInput): Promise<TranscribeResult> {
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    const { audioFile, language, userId, sessionId, mimeType } = input;

    let filePath: string;
    let shouldCleanup = false;

    // Handle Buffer input
    if (Buffer.isBuffer(audioFile)) {
      // Determine file extension from mime type or default to webm
      const ext = mimeType ? (MIME_TO_EXT[mimeType] || '.webm') : '.webm';
      const tempFileName = `whisper_${crypto.randomBytes(16).toString('hex')}${ext}`;
      filePath = path.join('/tmp', tempFileName);
      shouldCleanup = true;

      await pipeline(
        async function* () {
          yield audioFile;
        },
        createWriteStream(filePath)
      );
    } else {
      filePath = audioFile;
    }

    try {
      // Transcribe with Whisper - use verbose_json for detailed info
      const transcription = await openai.audio.transcriptions.create({
        file: createReadStream(filePath) as any,
        model: 'whisper-1',
        language: language || undefined, // Let Whisper auto-detect if not provided
        response_format: 'verbose_json',
        timestamp_granularities: ['word'] as any, // Get word-level timestamps
      });

      // Calculate confidence score from avg_logprob
      // avg_logprob ranges from -Infinity to 0, where 0 is perfect
      // Typical values are between -0.5 and -3
      const avgLogprob = (transcription as any).avg_logprob || -1;
      const confidence = this.calculateConfidenceFromLogprob(avgLogprob);

      // Extract word-level timing if available
      const words = (transcription as any).words?.map((w: any) => ({
        word: w.word || w.text,
        start: w.start || 0,
        end: w.end || 0,
        confidence: this.calculateConfidenceFromLogprob(w.logprob || avgLogprob),
      })) || undefined;

      const duration = Math.round((transcription as any).duration || 0);

      // Save to database
      if (userId && sessionId) {
        await db.insert(speechTranscriptions).values({
          userId,
          sessionId,
          audioUrl: shouldCleanup ? undefined : filePath,
          transcript: transcription.text,
          confidence,
          language: transcription.language || language || 'en',
          duration,
        });
      }

      return {
        transcript: transcription.text,
        confidence,
        language: transcription.language || language || 'en',
        duration,
        words,
      };
    } finally {
      // Clean up temporary file
      if (shouldCleanup && existsSync(filePath)) {
        try {
          unlinkSync(filePath);
        } catch (err) {
          console.error('Failed to cleanup temp file:', filePath, err);
        }
      }
    }
  }

  /**
   * Convert Whisper's log probability to confidence percentage
   * @param logprob - Log probability from Whisper (typically -0.5 to -3)
   * @returns Confidence score 0-100
   */
  private calculateConfidenceFromLogprob(logprob: number): number {
    // Whisper log probabilities are typically between -0.5 (very confident) and -3 (less confident)
    // Convert to percentage using exponential mapping
    if (logprob >= 0) return 100;
    if (logprob <= -3) return Math.max(50, Math.round(Math.exp(logprob + 3) * 50));

    // Map -0.5 to 100, -1.5 to 85, -3.0 to 50
    const confidence = Math.round(100 * Math.exp(logprob / 2));
    return Math.max(50, Math.min(100, confidence));
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
   * Analyze pronunciation with enhanced scoring
   */
  async analyzePronunciation(input: PronunciationInput): Promise<{
    accuracyScore: number;
    fluencyScore: number;
    prosodyScore: number;
    overallScore: number;
    feedback: string;
    phonemes: any[];
    detectedText: string;
    expectedText: string;
  }> {
    const { audioFile, expectedText, language, userId, sessionId, mimeType } = input;

    // First transcribe with word-level timestamps
    const transcriptionResult = await this.transcribe({
      audioFile,
      language,
      userId,
      sessionId,
      mimeType,
    });

    const { transcript, words, duration } = transcriptionResult;

    // Compare transcription with expected text
    const accuracyScore = this.calculateAccuracy(transcript, expectedText);

    // Analyze phonemes with word-level matching
    const phonemes = this.analyzePhonemes(transcript, expectedText, words);

    // Calculate fluency score (based on pauses, hesitations, speech rate)
    const fluencyScore = this.calculateFluency(transcript, words, duration);

    // Calculate prosody score (intonation, rhythm, stress)
    const prosodyScore = this.calculateProsody(words, duration, expectedText);

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      accuracyScore * 0.5 + fluencyScore * 0.3 + prosodyScore * 0.2
    );

    // Generate detailed feedback
    const feedback = this.generateFeedback(
      accuracyScore,
      fluencyScore,
      prosodyScore,
      phonemes
    );

    // Save analysis
    if (userId && sessionId) {
      await db.insert(pronunciationAnalyses).values({
        userId,
        sessionId,
        word: expectedText,
        phonemes,
        accuracyScore,
        fluencyScore,
        prosodyScore,
        feedback,
      });
    }

    return {
      accuracyScore,
      fluencyScore,
      prosodyScore,
      overallScore,
      feedback,
      phonemes,
      detectedText: transcript,
      expectedText,
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
   * Analyze phonemes with word-level confidence from Whisper
   */
  private analyzePhonemes(
    transcript: string,
    expected: string,
    words?: Array<{ word: string; start: number; end: number; confidence: number }>
  ): any[] {
    const transcriptWords = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const expectedWords = expected.toLowerCase().split(/\s+/).filter(w => w.length > 0);

    // Use dynamic programming for better word alignment
    const alignment = this.alignWords(expectedWords, transcriptWords);

    return expectedWords.map((word, idx) => {
      const alignedIdx = alignment[idx];
      const spokenWord = alignedIdx !== -1 ? transcriptWords[alignedIdx] : '';
      const isCorrect = word === spokenWord;

      // Get confidence from Whisper word-level data if available
      let wordConfidence = 50;
      if (words && alignedIdx !== -1 && alignedIdx < words.length) {
        wordConfidence = words[alignedIdx].confidence;
      } else if (isCorrect) {
        wordConfidence = 90;
      }

      // Calculate similarity score for partial credit
      const similarity = this.calculateWordSimilarity(word, spokenWord);

      return {
        word,
        spoken: spokenWord,
        correct: isCorrect,
        confidence: wordConfidence,
        similarity,
        timing: words && alignedIdx !== -1 && alignedIdx < words.length
          ? { start: words[alignedIdx].start, end: words[alignedIdx].end }
          : undefined,
      };
    });
  }

  /**
   * Align expected words with transcribed words using dynamic programming
   */
  private alignWords(expected: string[], transcribed: string[]): number[] {
    const alignment: number[] = new Array(expected.length).fill(-1);
    const used = new Set<number>();

    // First pass: exact matches
    for (let i = 0; i < expected.length; i++) {
      for (let j = 0; j < transcribed.length; j++) {
        if (!used.has(j) && expected[i] === transcribed[j]) {
          alignment[i] = j;
          used.add(j);
          break;
        }
      }
    }

    // Second pass: similar words (for remaining unmatched)
    for (let i = 0; i < expected.length; i++) {
      if (alignment[i] === -1) {
        let bestMatch = -1;
        let bestSimilarity = 0.5; // Minimum threshold

        for (let j = 0; j < transcribed.length; j++) {
          if (!used.has(j)) {
            const similarity = this.calculateWordSimilarity(expected[i], transcribed[j]);
            if (similarity > bestSimilarity) {
              bestSimilarity = similarity;
              bestMatch = j;
            }
          }
        }

        if (bestMatch !== -1) {
          alignment[i] = bestMatch;
          used.add(bestMatch);
        }
      }
    }

    return alignment;
  }

  /**
   * Calculate word similarity (0-1) using Levenshtein distance
   */
  private calculateWordSimilarity(word1: string, word2: string): number {
    if (!word1 || !word2) return 0;
    if (word1 === word2) return 1;

    const dist = this.levenshteinDistance(word1, word2);
    const maxLen = Math.max(word1.length, word2.length);
    return Math.max(0, (maxLen - dist) / maxLen);
  }

  /**
   * Calculate fluency score based on speech rate, pauses, and hesitations
   */
  private calculateFluency(
    transcript: string,
    words?: Array<{ word: string; start: number; end: number; confidence: number }>,
    duration?: number
  ): number {
    let score = 100;

    // Count filler words
    const fillers = ['um', 'uh', 'like', 'you know', 'er', 'ah'];
    let fillerCount = 0;

    fillers.forEach((filler) => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      fillerCount += (transcript.match(regex) || []).length;
    });

    // Penalize for fillers (each filler reduces score)
    const wordsCount = transcript.split(/\s+/).filter(w => w.length > 0).length;
    if (wordsCount > 0) {
      const fillerPenalty = Math.min(30, (fillerCount / wordsCount) * 100);
      score -= fillerPenalty;
    }

    // Analyze speech rate if timing data available
    if (words && words.length > 0 && duration && duration > 0) {
      // Normal speech rate: 120-150 words per minute
      const wordsPerMinute = (words.length / duration) * 60;

      if (wordsPerMinute < 80) {
        // Too slow
        score -= Math.min(20, (80 - wordsPerMinute) / 2);
      } else if (wordsPerMinute > 180) {
        // Too fast
        score -= Math.min(20, (wordsPerMinute - 180) / 3);
      }

      // Analyze pauses between words
      let longPauseCount = 0;
      for (let i = 1; i < words.length; i++) {
        const pause = words[i].start - words[i - 1].end;
        // Pauses longer than 1 second might indicate hesitation
        if (pause > 1.0) {
          longPauseCount++;
        }
      }

      // Penalize for excessive long pauses
      if (longPauseCount > words.length * 0.2) {
        score -= Math.min(15, longPauseCount * 2);
      }
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Calculate prosody score (rhythm, intonation, stress patterns)
   */
  private calculateProsody(
    words?: Array<{ word: string; start: number; end: number; confidence: number }>,
    duration?: number,
    expectedText?: string
  ): number {
    let score = 75; // Default baseline

    if (!words || words.length === 0 || !duration) {
      return score; // Return baseline if no timing data
    }

    // Analyze rhythm consistency
    const wordDurations = words.map((w, i) => w.end - w.start);
    const avgDuration = wordDurations.reduce((a, b) => a + b, 0) / wordDurations.length;
    const variance = wordDurations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / wordDurations.length;
    const stdDev = Math.sqrt(variance);

    // Good prosody has moderate variance (not too monotone, not too erratic)
    const coefficientOfVariation = avgDuration > 0 ? stdDev / avgDuration : 0;

    if (coefficientOfVariation > 0.3 && coefficientOfVariation < 0.8) {
      // Good variation
      score += 10;
    } else if (coefficientOfVariation < 0.2) {
      // Too monotone
      score -= 10;
    } else if (coefficientOfVariation > 1.0) {
      // Too erratic
      score -= 15;
    }

    // Analyze gaps and continuity
    const gaps = [];
    for (let i = 1; i < words.length; i++) {
      gaps.push(words[i].start - words[i - 1].end);
    }

    if (gaps.length > 0) {
      const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      // Natural gaps are around 0.1-0.3 seconds
      if (avgGap > 0.05 && avgGap < 0.4) {
        score += 5;
      } else if (avgGap > 0.6) {
        score -= 10; // Too many long pauses
      }
    }

    // Check confidence consistency (good prosody correlates with confidence)
    const avgConfidence = words.reduce((sum, w) => sum + w.confidence, 0) / words.length;
    if (avgConfidence > 85) {
      score += 10;
    } else if (avgConfidence < 60) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Generate detailed feedback based on all scores
   */
  private generateFeedback(
    accuracy: number,
    fluency: number,
    prosody: number,
    phonemes: any[]
  ): string {
    const feedbackParts: string[] = [];

    // Overall assessment
    const overall = Math.round((accuracy * 0.5 + fluency * 0.3 + prosody * 0.2));
    if (overall >= 90) {
      feedbackParts.push('🌟 Outstanding performance!');
    } else if (overall >= 80) {
      feedbackParts.push('👍 Great job!');
    } else if (overall >= 70) {
      feedbackParts.push('👏 Good effort!');
    } else {
      feedbackParts.push('💪 Keep practicing!');
    }

    // Accuracy feedback
    if (accuracy >= 90) {
      feedbackParts.push('Your pronunciation is excellent!');
    } else if (accuracy >= 75) {
      feedbackParts.push('Good pronunciation with some minor errors.');
    } else if (accuracy >= 60) {
      feedbackParts.push('Your pronunciation needs some improvement.');
    } else {
      feedbackParts.push('Focus on pronouncing words more clearly.');
    }

    // Fluency feedback
    if (fluency >= 90) {
      feedbackParts.push('Very fluent and natural delivery!');
    } else if (fluency >= 75) {
      feedbackParts.push('Good fluency - try to reduce hesitations.');
    } else if (fluency >= 60) {
      feedbackParts.push('Work on speaking more smoothly with fewer pauses.');
    } else {
      feedbackParts.push('Practice speaking at a more consistent pace.');
    }

    // Prosody feedback
    if (prosody >= 85) {
      feedbackParts.push('Excellent rhythm and intonation!');
    } else if (prosody >= 70) {
      feedbackParts.push('Good rhythm - keep working on natural speech patterns.');
    } else {
      feedbackParts.push('Focus on the rhythm and flow of your speech.');
    }

    // Specific word corrections
    const incorrectWords = phonemes.filter((p) => !p.correct);
    const partiallyCorrect = phonemes.filter((p) => !p.correct && p.similarity > 0.6);

    if (incorrectWords.length > 0) {
      if (incorrectWords.length <= 3) {
        feedbackParts.push(
          `Pay special attention to: ${incorrectWords.map((w) => `"${w.word}" (you said "${w.spoken || 'nothing'}")`).join(', ')}.`
        );
      } else {
        feedbackParts.push(
          `Focus on these words: ${incorrectWords.slice(0, 3).map((w) => `"${w.word}"`).join(', ')} and ${incorrectWords.length - 3} others.`
        );
      }
    }

    if (partiallyCorrect.length > 0) {
      feedbackParts.push(
        `You're close on: ${partiallyCorrect.map((w) => `"${w.word}"`).join(', ')} - just needs slight adjustment.`
      );
    }

    return feedbackParts.join(' ');
  }
}
