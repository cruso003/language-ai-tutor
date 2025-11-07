/**
 * Speech Analysis Service
 *
 * Analyzes user speech for:
 * - Pronunciation accuracy
 * - Response latency (fluency indicator)
 * - Hesitation patterns
 * - Speech rate
 *
 * Usage with expo-audio:
 *
 * In your React component:
 *
 * import { useAudioRecorder, RecordingPresets, useAudioRecorderState } from 'expo-audio';
 *
 * const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
 * const recorderState = useAudioRecorderState(audioRecorder);
 *
 * // Start recording
 * await speechService.startRecording(audioRecorder);
 *
 * // Stop recording
 * const result = await speechService.stopRecording(audioRecorder);
 */

import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from "expo-audio";
import OpenAI from "openai";
import { PronunciationFeedback } from "../types";

export interface SpeechMetrics {
  responseLatency: number; // milliseconds from prompt to response
  speechDuration: number; // milliseconds of actual speech
  hesitationCount: number; // number of pauses
  wordsPerMinute: number;
}

export class SpeechAnalysisService {
  private openai: OpenAI;
  private recordingStartTime: number = 0;
  private promptTime: number = 0;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (status.granted) {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to request audio permissions:", error);
      return false;
    }
  }

  markPromptTime() {
    this.promptTime = Date.now();
  }

  async startRecording(audioRecorder: any): Promise<void> {
    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      this.recordingStartTime = Date.now();
    } catch (error) {
      console.error("Failed to start recording:", error);
      throw error;
    }
  }

  async stopRecording(audioRecorder: any): Promise<{
    uri: string;
    duration: number;
    responseLatency: number;
  }> {
    if (!audioRecorder) {
      throw new Error("No audio recorder provided");
    }

    try {
      // The recording will be available on audioRecorder.uri after stopping
      await audioRecorder.stop();
      const duration = Date.now() - this.recordingStartTime;
      const responseLatency = this.recordingStartTime - this.promptTime;

      return {
        uri: audioRecorder.uri,
        duration,
        responseLatency,
      };
    } catch (error) {
      console.error("Failed to stop recording:", error);
      throw error;
    }
  }

  async transcribeAudio(audioUri: string): Promise<string> {
    try {
      // Convert audio file to format OpenAI accepts
      const response = await fetch(audioUri);
      const blob = await response.blob();

      // Create File object for OpenAI
      const file = new File([blob], "audio.m4a", { type: "audio/m4a" });

      const transcription = await this.openai.audio.transcriptions.create({
        file: file,
        model: "whisper-1",
        language: "es", // TODO: Make this dynamic based on target language
      });

      return transcription.text;
    } catch (error) {
      console.error("Transcription error:", error);
      throw error;
    }
  }

  async analyzePronunciation(
    audioUri: string,
    expectedText: string,
    targetLanguage: string
  ): Promise<PronunciationFeedback | null> {
    try {
      // First, transcribe to see what was actually said
      const transcribed = await this.transcribeAudio(audioUri);

      // Use GPT-4 to analyze pronunciation based on transcription vs expected
      const analysisPrompt = `Analyze pronunciation quality for a ${targetLanguage} learner:

Expected: "${expectedText}"
Actually said: "${transcribed}"

Identify pronunciation issues and provide specific feedback. Return JSON:
{
  "word": "the word with issues",
  "accuracy": 0-100,
  "issues": [
    {
      "phoneme": "specific sound",
      "expected": "how it should sound",
      "actual": "how it was pronounced",
      "suggestion": "tip for improvement"
    }
  ]
}

If pronunciation was good, return {"word": "", "accuracy": 90, "issues": []}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: analysisPrompt }],
        temperature: 0.2,
        response_format: { type: "json_object" },
      });

      const feedback = JSON.parse(response.choices[0].message.content || "{}");
      return feedback as PronunciationFeedback;
    } catch (error) {
      console.error("Pronunciation analysis error:", error);
      return null;
    }
  }

  calculateMetrics(
    responseLatency: number,
    speechDuration: number,
    wordCount: number
  ): SpeechMetrics {
    const wordsPerMinute = (wordCount / (speechDuration / 1000)) * 60;

    // Estimate hesitation count based on speech rate
    // Native speakers: 150-160 WPM, learners: 60-100 WPM
    const expectedWPM = 120;
    const hesitationCount = Math.max(
      0,
      Math.floor((expectedWPM - wordsPerMinute) / 20)
    );

    return {
      responseLatency,
      speechDuration,
      hesitationCount,
      wordsPerMinute,
    };
  }
}

export default SpeechAnalysisService;
