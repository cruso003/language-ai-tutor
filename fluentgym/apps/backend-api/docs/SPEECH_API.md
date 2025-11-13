# Speech API Documentation

The Speech API provides comprehensive speech processing capabilities for the FluentAI language learning platform, powered by OpenAI's Whisper and TTS models.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [List Voices](#list-voices)
  - [Transcribe Audio](#transcribe-audio)
  - [Synthesize Speech](#synthesize-speech)
  - [Analyze Pronunciation](#analyze-pronunciation)
- [Audio Format Support](#audio-format-support)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)

---

## Overview

The Speech API offers four main capabilities:

1. **Speech-to-Text (Transcription)** - Convert audio to text using OpenAI Whisper
2. **Text-to-Speech (Synthesis)** - Generate natural-sounding speech from text
3. **Pronunciation Analysis** - Detailed feedback on pronunciation quality
4. **Voice Management** - List available TTS voices

All speech processing uses OpenAI's models:
- **Whisper-1** for transcription (supports 50+ languages)
- **TTS-1** for text-to-speech
- Word-level timestamps for detailed analysis

---

## Authentication

Authentication is **optional** by default but recommended. If enabled (via `SUPABASE_JWT_SECRET`), include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### List Voices

Get available text-to-speech voices.

**Endpoint:** `GET /api/v1/speech/voices`

**Response:**
```json
{
  "voices": [
    { "id": "alloy", "name": "Alloy", "provider": "openai" },
    { "id": "echo", "name": "Echo", "provider": "openai" },
    { "id": "fable", "name": "Fable", "provider": "openai" },
    { "id": "onyx", "name": "Onyx", "provider": "openai" },
    { "id": "nova", "name": "Nova", "provider": "openai" },
    { "id": "shimmer", "name": "Shimmer", "provider": "openai" }
  ]
}
```

---

### Transcribe Audio

Convert audio to text with word-level timestamps and confidence scores.

**Endpoint:** `POST /api/v1/speech/transcribe`

**Content-Type:** `multipart/form-data` or `application/json`

#### Option 1: Multipart File Upload (Recommended)

```http
POST /api/v1/speech/transcribe
Content-Type: multipart/form-data

Form fields:
- file: <audio file> (required)
- language: <language code> (optional, e.g., "en", "es", "fr")
- sessionId: <uuid> (optional)
```

**Example (curl):**
```bash
curl -X POST http://localhost:3001/api/v1/speech/transcribe \
  -F "file=@recording.webm" \
  -F "language=es" \
  -F "sessionId=123e4567-e89b-12d3-a456-426614174000"
```

#### Option 2: JSON with Base64 Audio

```json
{
  "audioBase64": "base64-encoded-audio-data",
  "language": "es",
  "sessionId": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Response

```json
{
  "transcript": "Hola, ¿cómo estás?",
  "confidence": 95,
  "language": "es",
  "duration": 2,
  "audioUrl": "https://cloudinary.com/...",
  "words": [
    {
      "word": "Hola",
      "start": 0.0,
      "end": 0.4,
      "confidence": 98
    },
    {
      "word": "cómo",
      "start": 0.5,
      "end": 0.8,
      "confidence": 95
    },
    {
      "word": "estás",
      "start": 0.9,
      "end": 1.3,
      "confidence": 92
    }
  ]
}
```

**Response Fields:**
- `transcript` - Full transcribed text
- `confidence` - Overall confidence score (0-100)
- `language` - Detected/specified language code
- `duration` - Audio duration in seconds
- `audioUrl` - URL to stored audio (if Cloudinary configured)
- `words` - Array of word-level timing and confidence data

---

### Synthesize Speech

Generate audio from text.

**Endpoint:** `POST /api/v1/speech/synthesize`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "text": "Hello, how are you today?",
  "voice": "alloy",
  "speed": 1.0,
  "language": "en"
}
```

**Request Fields:**
- `text` (required) - Text to convert to speech
- `voice` (optional) - Voice ID (default: "alloy")
  - Options: alloy, echo, fable, onyx, nova, shimmer
- `speed` (optional) - Speech speed (0.5-2.0, default: 1.0)
- `language` (optional) - Language code

**Response:**
- Content-Type: `audio/mpeg`
- Binary MP3 audio data

**Example (curl):**
```bash
curl -X POST http://localhost:3001/api/v1/speech/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","voice":"nova","speed":1.1}' \
  --output speech.mp3
```

**Example (JavaScript):**
```javascript
const response = await fetch('/api/v1/speech/synthesize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Bonjour, comment allez-vous?',
    voice: 'shimmer',
    speed: 1.0
  })
});

const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);
const audio = new Audio(audioUrl);
audio.play();
```

---

### Analyze Pronunciation

Comprehensive pronunciation analysis with scoring and feedback.

**Endpoint:** `POST /api/v1/speech/analyze`

**Content-Type:** `multipart/form-data` or `application/json`

#### Option 1: Multipart File Upload (Recommended)

```http
POST /api/v1/speech/analyze
Content-Type: multipart/form-data

Form fields:
- file: <audio file> (required)
- expectedText: <text to compare> (required)
- language: <language code> (optional, default: "en")
- sessionId: <uuid> (optional)
```

**Example (curl):**
```bash
curl -X POST http://localhost:3001/api/v1/speech/analyze \
  -F "file=@pronunciation.webm" \
  -F "expectedText=The quick brown fox jumps over the lazy dog" \
  -F "language=en"
```

#### Option 2: JSON with Base64 Audio

```json
{
  "audioBase64": "base64-encoded-audio-data",
  "expectedText": "The quick brown fox",
  "language": "en",
  "sessionId": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Response

```json
{
  "accuracyScore": 87,
  "fluencyScore": 82,
  "prosodyScore": 75,
  "overallScore": 83,
  "feedback": "👍 Great job! Your pronunciation is excellent! Good fluency - try to reduce hesitations. Good rhythm - keep working on natural speech patterns.",
  "detectedText": "The quick brown fox jumps over the lazy dog",
  "expectedText": "The quick brown fox jumps over the lazy dog",
  "phonemes": [
    {
      "word": "the",
      "spoken": "the",
      "correct": true,
      "confidence": 98,
      "similarity": 1.0,
      "timing": {
        "start": 0.0,
        "end": 0.2
      }
    },
    {
      "word": "quick",
      "spoken": "quick",
      "correct": true,
      "confidence": 95,
      "similarity": 1.0,
      "timing": {
        "start": 0.3,
        "end": 0.6
      }
    }
  ]
}
```

**Response Fields:**

- **Scoring (0-100):**
  - `accuracyScore` - Word pronunciation accuracy (50% weight)
  - `fluencyScore` - Speech fluency and pace (30% weight)
  - `prosodyScore` - Rhythm, intonation, stress (20% weight)
  - `overallScore` - Weighted average of all scores

- **Feedback:**
  - `feedback` - Detailed, actionable feedback string
  - `detectedText` - What was actually spoken
  - `expectedText` - What should have been spoken

- **Word Analysis (`phonemes`):**
  - `word` - Expected word
  - `spoken` - Detected word
  - `correct` - Boolean match
  - `confidence` - Detection confidence (0-100)
  - `similarity` - Similarity score (0-1)
  - `timing` - Start/end timestamps in seconds

**Scoring Details:**

| Score Range | Accuracy | Fluency | Prosody |
|-------------|----------|---------|---------|
| 90-100 | Excellent pronunciation | Very fluent, natural | Excellent rhythm |
| 75-89 | Good with minor errors | Good, slight hesitations | Good rhythm |
| 60-74 | Needs improvement | Noticeable pauses | Working on patterns |
| 0-59 | Focus on clarity | Improve pace | Focus on flow |

---

## Audio Format Support

### Supported Formats

The API supports all formats compatible with OpenAI Whisper:

- **WebM** (`.webm`) - Recommended for web recording
- **MP3** (`.mp3`)
- **MP4** (`.mp4`, `.m4a`)
- **WAV** (`.wav`)
- **OGG** (`.ogg`)
- **FLAC** (`.flac`)

### File Size Limits

- **Maximum file size:** 10 MB
- **Maximum files per request:** 1

### Recommendations

- **Sample rate:** 16 kHz or higher
- **Bit rate:** 128 kbps or higher for best results
- **Mono vs Stereo:** Mono is sufficient and reduces file size
- **Format:** WebM with Opus codec for web apps

---

## Error Handling

### Common Error Responses

**401 Unauthorized** (if auth enabled):
```json
{
  "error": "Unauthorized"
}
```

**400 Bad Request** - Invalid input:
```json
{
  "error": "Invalid payload",
  "issues": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["expectedText"],
      "message": "Required"
    }
  ]
}
```

**500 Internal Server Error** - Processing failed:
```json
{
  "error": "Failed to transcribe audio"
}
```

### Error Codes

- `401` - Authentication required or invalid token
- `400` - Invalid request (missing fields, invalid format)
- `413` - File too large (>10MB)
- `500` - Server error (API key issue, processing failure)

---

## Usage Examples

### React Native / Expo Example

#### Recording and Transcription

```typescript
import { Audio } from 'expo-av';

// Record audio
const recording = new Audio.Recording();
await recording.prepareToRecordAsync(
  Audio.RecordingOptionsPresets.HIGH_QUALITY
);
await recording.startAsync();

// ... user speaks ...

await recording.stopAndUnloadAsync();
const uri = recording.getURI();

// Transcribe
const formData = new FormData();
formData.append('file', {
  uri,
  type: 'audio/m4a',
  name: 'recording.m4a',
} as any);
formData.append('language', 'es');

const response = await fetch('http://localhost:3001/api/v1/speech/transcribe', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const result = await response.json();
console.log('Transcript:', result.transcript);
console.log('Confidence:', result.confidence);
```

#### Pronunciation Analysis

```typescript
// Record user pronunciation
const recording = await recordAudio();
const uri = recording.getURI();

// Analyze
const formData = new FormData();
formData.append('file', {
  uri,
  type: 'audio/m4a',
  name: 'pronunciation.m4a',
} as any);
formData.append('expectedText', 'Hello, how are you?');
formData.append('language', 'en');

const response = await fetch('http://localhost:3001/api/v1/speech/analyze', {
  method: 'POST',
  body: formData,
});

const analysis = await response.json();

console.log('Overall Score:', analysis.overallScore);
console.log('Feedback:', analysis.feedback);

// Show word-by-word results
analysis.phonemes.forEach(phoneme => {
  console.log(`${phoneme.word}: ${phoneme.correct ? '✓' : '✗'} (${phoneme.confidence}%)`);
});
```

#### Text-to-Speech

```typescript
import { Audio } from 'expo-av';

async function playTextToSpeech(text: string, voice: string = 'alloy') {
  const response = await fetch('http://localhost:3001/api/v1/speech/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice, speed: 1.0 }),
  });

  const audioBlob = await response.blob();

  // Save to file system
  const fileUri = `${FileSystem.cacheDirectory}tts.mp3`;
  await FileSystem.writeAsStringAsync(
    fileUri,
    await audioBlob.text(),
    { encoding: FileSystem.EncodingType.Base64 }
  );

  // Play audio
  const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
  await sound.playAsync();
}
```

### Web Example (React)

```typescript
import { useState } from 'react';

function PronunciationPractice() {
  const [recording, setRecording] = useState<MediaRecorder | null>(null);
  const [result, setResult] = useState<any>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: 'audio/webm' });
      await analyzePronunciation(audioBlob);
    };

    mediaRecorder.start();
    setRecording(mediaRecorder);
  };

  const stopRecording = () => {
    recording?.stop();
    setRecording(null);
  };

  const analyzePronunciation = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('expectedText', 'Hello, how are you today?');
    formData.append('language', 'en');

    const response = await fetch('/api/v1/speech/analyze', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    setResult(data);
  };

  return (
    <div>
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? 'Stop' : 'Start'} Recording
      </button>

      {result && (
        <div>
          <h3>Overall Score: {result.overallScore}/100</h3>
          <p>{result.feedback}</p>

          <h4>Word Analysis:</h4>
          {result.phonemes.map((p: any, i: number) => (
            <div key={i} style={{ color: p.correct ? 'green' : 'red' }}>
              {p.word}: {p.correct ? '✓' : '✗'}
              ({p.confidence}% confidence)
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Best Practices

### 1. Audio Quality
- Use a good microphone
- Record in a quiet environment
- Maintain consistent volume
- Avoid background noise

### 2. Performance
- Use multipart uploads for better reliability
- Compress audio before upload when possible
- Cache TTS audio for repeated phrases
- Store transcriptions to avoid re-processing

### 3. User Experience
- Show real-time recording indicator
- Display confidence scores to users
- Provide visual feedback during analysis
- Allow users to retry pronunciations

### 4. Error Handling
- Handle network failures gracefully
- Validate audio before upload
- Provide helpful error messages
- Implement retry logic for transient failures

### 5. Privacy & Security
- Store audio temporarily only
- Delete recordings after processing
- Don't store sensitive audio without consent
- Use authentication for production

---

## Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Database

The Speech API stores metadata in these tables:
- `speech_transcriptions` - Transcription history
- `pronunciation_analyses` - Pronunciation analysis results

---

## Limitations

1. **File Size:** 10MB maximum per request
2. **Duration:** No hard limit, but longer audio takes longer to process
3. **Rate Limiting:** Subject to server rate limits (default: 100 req/min)
4. **Languages:** Whisper supports 50+ languages, but accuracy varies
5. **Concurrent Requests:** OpenAI API has rate limits

---

## Support

For issues or questions:
- Check server logs for detailed error messages
- Verify OPENAI_API_KEY is configured
- Ensure audio format is supported
- Test with smaller files first

---

## Changelog

### v0.2.0 (Current)
- ✅ Enhanced Whisper integration with word-level timestamps
- ✅ Improved confidence scoring algorithm
- ✅ Prosody analysis for pronunciation
- ✅ Better file handling with cleanup
- ✅ Multipart file upload support
- ✅ Comprehensive OpenAPI schema

### v0.1.0
- Initial speech API implementation
- Basic transcription and TTS
- Simple pronunciation analysis
