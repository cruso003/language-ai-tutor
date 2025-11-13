import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { SpeechService } from '../services/SpeechService';
import { fileStorage } from '../services/FileStorageService';
import { isAuthEnabled } from '../plugins/auth';

const speechService = new SpeechService();

export async function registerSpeechRoutes(app: FastifyInstance) {
  // List voices
  app.get('/api/v1/speech/voices', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const voices = await speechService.listVoices();
      return reply.send({ voices });
    } catch (err: any) {
      req.log.error({ err }, 'speech_list_voices_error');
      return reply.status(500).send({ error: 'Failed to list voices' });
    }
  });

  // Transcribe audio (expects multipart/form-data or base64 string)
  const TranscribeSchema = z.object({
    language: z.string().optional(),
    sessionId: z.string().uuid().optional(),
  });

  app.post('/api/v1/speech/transcribe', async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && !req.auth?.userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const parsed = TranscribeSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', issues: parsed.error.issues });
    }
    try {
      const audioBuffer = (req as any).fileBuffer || (parsed.success && (req.body as any).audioBase64 ? Buffer.from((req.body as any).audioBase64, 'base64') : null);
      if (!audioBuffer) {
        return reply.status(400).send({ error: 'Missing audio data' });
      }

      // Upload audio to Cloudinary for storage
      let audioUrl: string | undefined;
      if (req.auth?.userId && process.env.CLOUDINARY_CLOUD_NAME) {
        try {
          const upload = await fileStorage.uploadAudio(audioBuffer, req.auth.userId, parsed.data.sessionId);
          audioUrl = upload.secureUrl;
        } catch (uploadErr) {
          req.log.warn({ err: uploadErr }, 'audio_upload_failed_continuing_transcription');
        }
      }

      const result = await speechService.transcribe({
        audioFile: audioBuffer,
        language: parsed.data.language,
        userId: req.auth?.userId,
        sessionId: parsed.data.sessionId,
      });
      return reply.send({ ...result, audioUrl });
    } catch (err: any) {
      req.log.error({ err }, 'speech_transcribe_error');
      return reply.status(500).send({ error: 'Failed to transcribe audio' });
    }
  });

  // Synthesize speech
  const SynthesizeSchema = z.object({
    text: z.string().min(1),
    voice: z.string().optional(),
    speed: z.number().min(0.5).max(2).optional(),
    language: z.string().optional(),
  });
  app.post('/api/v1/speech/synthesize', async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && !req.auth?.userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
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
      return reply.status(500).send({ error: 'Failed to synthesize speech' });
    }
  });

  // Pronunciation analysis
  const PronounceSchema = z.object({
    expectedText: z.string().min(1),
    language: z.string().default('en'),
    sessionId: z.string().uuid().optional(),
    audioBase64: z.string().min(20),
  });
  app.post('/api/v1/speech/analyze', async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && !req.auth?.userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const parsed = PronounceSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', issues: parsed.error.issues });
    }
    try {
      const audioBuffer = Buffer.from(parsed.data.audioBase64, 'base64');
      const result = await speechService.analyzePronunciation({
        audioFile: audioBuffer,
        expectedText: parsed.data.expectedText,
        language: parsed.data.language,
        userId: req.auth?.userId,
        sessionId: parsed.data.sessionId,
      });
      return reply.send(result);
    } catch (err: any) {
      req.log.error({ err }, 'speech_analyze_error');
      return reply.status(500).send({ error: 'Failed to analyze pronunciation' });
    }
  });
}
