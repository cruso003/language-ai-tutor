import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { SpeechService } from '../services/SpeechService';
import { fileStorage } from '../services/FileStorageService';
import { isAuthEnabled } from '../plugins/auth';
import type { MultipartFile } from '@fastify/multipart';

const speechService = new SpeechService();

export async function registerSpeechRoutes(app: FastifyInstance) {
  // List voices
  app.get('/api/v1/speech/voices', {
    schema: {
      description: 'List available text-to-speech voices',
      tags: ['Speech'],
      response: {
        200: {
          type: 'object',
          properties: {
            voices: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  provider: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const voices = await speechService.listVoices();
      return reply.send({ voices });
    } catch (err: any) {
      req.log.error({ err }, 'speech_list_voices_error');
      return reply.status(500).send({ error: 'Failed to list voices' });
    }
  });

  // Transcribe audio (multipart/form-data with file or JSON with base64)
  app.post('/api/v1/speech/transcribe', {
    schema: {
      description: 'Transcribe audio to text using OpenAI Whisper',
      tags: ['Speech'],
      consumes: ['multipart/form-data', 'application/json'],
      response: {
        200: {
          type: 'object',
          properties: {
            transcript: { type: 'string' },
            confidence: { type: 'number' },
            language: { type: 'string' },
            duration: { type: 'number' },
            audioUrl: { type: 'string' },
            words: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  word: { type: 'string' },
                  start: { type: 'number' },
                  end: { type: 'number' },
                  confidence: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && !req.auth?.userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    try {
      let audioBuffer: Buffer | null = null;
      let language: string | undefined;
      let sessionId: string | undefined;
      let mimeType: string | undefined;

      // Check if this is multipart form data
      if (req.isMultipart()) {
        const data = await req.file();

        if (!data) {
          return reply.status(400).send({ error: 'No file uploaded' });
        }

        audioBuffer = await data.toBuffer();
        mimeType = data.mimetype;

        // Get additional fields from form data
        const fields = data.fields as any;
        language = fields.language?.value;
        sessionId = fields.sessionId?.value;
      } else {
        // Handle JSON body with base64 audio
        const TranscribeSchema = z.object({
          audioBase64: z.string().min(20),
          language: z.string().optional(),
          sessionId: z.string().uuid().optional(),
        });

        const parsed = TranscribeSchema.safeParse(req.body);
        if (!parsed.success) {
          return reply.status(400).send({
            error: 'Invalid payload',
            issues: parsed.error.issues
          });
        }

        audioBuffer = Buffer.from(parsed.data.audioBase64, 'base64');
        language = parsed.data.language;
        sessionId = parsed.data.sessionId;
      }

      if (!audioBuffer) {
        return reply.status(400).send({ error: 'Missing audio data' });
      }

      // Upload audio to Cloudinary for storage
      let audioUrl: string | undefined;
      if (req.auth?.userId && process.env.CLOUDINARY_CLOUD_NAME) {
        try {
          const upload = await fileStorage.uploadAudio(audioBuffer, req.auth.userId, sessionId);
          audioUrl = upload.secureUrl;
        } catch (uploadErr) {
          req.log.warn({ err: uploadErr }, 'audio_upload_failed_continuing_transcription');
        }
      }

      const result = await speechService.transcribe({
        audioFile: audioBuffer,
        language,
        userId: req.auth?.userId,
        sessionId,
        mimeType,
      });

      return reply.send({ ...result, audioUrl });
    } catch (err: any) {
      req.log.error({ err }, 'speech_transcribe_error');
      return reply.status(500).send({ error: err.message || 'Failed to transcribe audio' });
    }
  });

  // Synthesize speech (text-to-speech)
  app.post('/api/v1/speech/synthesize', {
    schema: {
      description: 'Convert text to speech using OpenAI TTS',
      tags: ['Speech'],
      body: {
        type: 'object',
        required: ['text'],
        properties: {
          text: { type: 'string', minLength: 1 },
          voice: {
            type: 'string',
            enum: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
            default: 'alloy',
          },
          speed: {
            type: 'number',
            minimum: 0.5,
            maximum: 2,
            default: 1.0,
          },
          language: { type: 'string' },
        },
      },
      response: {
        200: {
          description: 'Audio file (audio/mpeg)',
          type: 'string',
          format: 'binary',
        },
      },
    },
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && !req.auth?.userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const SynthesizeSchema = z.object({
      text: z.string().min(1),
      voice: z.string().optional(),
      speed: z.number().min(0.5).max(2).optional(),
      language: z.string().optional(),
    });

    const parsed = SynthesizeSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', issues: parsed.error.issues });
    }

    try {
      const audioBuffer = await speechService.synthesize(parsed.data);
      reply.header('Content-Type', 'audio/mpeg');
      return reply.send(audioBuffer);
    } catch (err: any) {
      req.log.error({ err }, 'speech_synthesize_error');
      return reply.status(500).send({ error: err.message || 'Failed to synthesize speech' });
    }
  });

  // Pronunciation analysis (multipart or JSON with base64)
  app.post('/api/v1/speech/analyze', {
    schema: {
      description: 'Analyze pronunciation with detailed scoring and feedback',
      tags: ['Speech'],
      consumes: ['multipart/form-data', 'application/json'],
      response: {
        200: {
          type: 'object',
          properties: {
            accuracyScore: { type: 'number' },
            fluencyScore: { type: 'number' },
            prosodyScore: { type: 'number' },
            overallScore: { type: 'number' },
            feedback: { type: 'string' },
            detectedText: { type: 'string' },
            expectedText: { type: 'string' },
            phonemes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  word: { type: 'string' },
                  spoken: { type: 'string' },
                  correct: { type: 'boolean' },
                  confidence: { type: 'number' },
                  similarity: { type: 'number' },
                  timing: {
                    type: 'object',
                    properties: {
                      start: { type: 'number' },
                      end: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && !req.auth?.userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    try {
      let audioBuffer: Buffer | null = null;
      let expectedText: string;
      let language: string = 'en';
      let sessionId: string | undefined;
      let mimeType: string | undefined;

      // Check if this is multipart form data
      if (req.isMultipart()) {
        const data = await req.file();

        if (!data) {
          return reply.status(400).send({ error: 'No file uploaded' });
        }

        audioBuffer = await data.toBuffer();
        mimeType = data.mimetype;

        // Get additional fields from form data
        const fields = data.fields as any;
        expectedText = fields.expectedText?.value;
        language = fields.language?.value || 'en';
        sessionId = fields.sessionId?.value;

        if (!expectedText) {
          return reply.status(400).send({ error: 'expectedText field is required' });
        }
      } else {
        // Handle JSON body with base64 audio
        const PronounceSchema = z.object({
          expectedText: z.string().min(1),
          language: z.string().default('en'),
          sessionId: z.string().uuid().optional(),
          audioBase64: z.string().min(20),
        });

        const parsed = PronounceSchema.safeParse(req.body);
        if (!parsed.success) {
          return reply.status(400).send({
            error: 'Invalid payload',
            issues: parsed.error.issues
          });
        }

        audioBuffer = Buffer.from(parsed.data.audioBase64, 'base64');
        expectedText = parsed.data.expectedText;
        language = parsed.data.language;
        sessionId = parsed.data.sessionId;
      }

      if (!audioBuffer) {
        return reply.status(400).send({ error: 'Missing audio data' });
      }

      const result = await speechService.analyzePronunciation({
        audioFile: audioBuffer,
        expectedText,
        language,
        userId: req.auth?.userId,
        sessionId,
        mimeType,
      });

      return reply.send(result);
    } catch (err: any) {
      req.log.error({ err }, 'speech_analyze_error');
      return reply.status(500).send({ error: err.message || 'Failed to analyze pronunciation' });
    }
  });
}
