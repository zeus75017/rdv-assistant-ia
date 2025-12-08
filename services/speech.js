/**
 * Service Speech-to-Text
 *
 * Note: Pour le MVP, on utilise le STT intégré de Twilio (gratuit).
 * Ce fichier est préparé pour une future intégration avec Whisper (OpenAI)
 * pour une meilleure précision si nécessaire.
 */

const OpenAI = require('openai');

// Client OpenAI pour Whisper (optionnel)
let openai = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

/**
 * Transcrit l'audio avec Whisper (OpenAI)
 * Utilisé pour le streaming WebSocket si besoin de meilleure précision
 *
 * @param {Buffer} audioBuffer - Audio en format WAV ou MP3
 * @returns {string} - Texte transcrit
 */
async function transcribeWithWhisper(audioBuffer) {
  if (!openai) {
    throw new Error('OpenAI API key non configurée');
  }

  try {
    // Créer un fichier temporaire pour l'audio
    const fs = require('fs');
    const path = require('path');
    const tempFile = path.join(__dirname, `../temp_${Date.now()}.wav`);

    fs.writeFileSync(tempFile, audioBuffer);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFile),
      model: 'whisper-1',
      language: 'fr'
    });

    // Nettoyer le fichier temporaire
    fs.unlinkSync(tempFile);

    return transcription.text;
  } catch (error) {
    console.error('Erreur Whisper:', error);
    throw error;
  }
}

/**
 * Buffer pour accumuler l'audio en streaming
 */
const audioBuffers = new Map();

/**
 * Traite l'audio en streaming (WebSocket)
 * Accumule les chunks et transcrit quand il y a assez de données
 *
 * @param {string} base64Audio - Audio encodé en base64
 * @param {WebSocket} ws - WebSocket pour répondre
 */
async function processAudioStream(base64Audio, ws) {
  // Pour le MVP, on utilise le STT de Twilio directement
  // Cette fonction est préparée pour une future amélioration

  // Décoder l'audio
  const audioChunk = Buffer.from(base64Audio, 'base64');

  // Dans une version avancée, on accumulerait les chunks
  // et on les enverrait à Whisper pour transcription
  // puis on répondrait via le WebSocket

  console.log('📊 Chunk audio reçu:', audioChunk.length, 'bytes');
}

/**
 * Détecte le silence dans l'audio (pour savoir quand l'utilisateur a fini de parler)
 *
 * @param {Buffer} audioBuffer - Audio buffer
 * @returns {boolean} - True si silence détecté
 */
function detectSilence(audioBuffer) {
  // Analyse simple du volume
  let sum = 0;

  for (let i = 0; i < audioBuffer.length; i += 2) {
    const sample = audioBuffer.readInt16LE(i);
    sum += Math.abs(sample);
  }

  const average = sum / (audioBuffer.length / 2);
  const threshold = 500; // Ajuster selon le bruit de fond

  return average < threshold;
}

module.exports = {
  transcribeWithWhisper,
  processAudioStream,
  detectSilence
};
