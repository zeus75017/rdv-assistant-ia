/**
 * Service Text-to-Speech
 *
 * Pour le MVP, on utilise les voix Polly intégrées à Twilio (gratuit).
 * Ce fichier prépare l'intégration avec ElevenLabs pour des voix plus naturelles.
 */

// Voix Twilio/Polly disponibles en français
const TWILIO_VOICES = {
  // Voix françaises standard
  lea: 'Polly.Lea',        // Femme, France
  celine: 'Polly.Celine',  // Femme, France
  mathieu: 'Polly.Mathieu', // Homme, France

  // Voix françaises neurales (plus naturelles)
  lea_neural: 'Polly.Lea-Neural',

  // Voix Google
  google_fr: 'Google.fr-FR-Standard-A'
};

// Configuration par défaut
const DEFAULT_VOICE = TWILIO_VOICES.lea;

/**
 * Retourne la configuration de voix pour TwiML
 */
function getVoiceConfig(voiceName = 'lea') {
  return {
    voice: TWILIO_VOICES[voiceName] || DEFAULT_VOICE,
    language: 'fr-FR'
  };
}

/**
 * Formate le texte pour une meilleure prononciation
 * Ajoute des pauses, corrige les acronymes, etc.
 */
function formatTextForSpeech(text) {
  let formatted = text;

  // Ajouter des pauses après les points
  formatted = formatted.replace(/\. /g, '. <break time="300ms"/> ');

  // Corriger les acronymes courants
  formatted = formatted.replace(/SMS/g, 'S M S');
  formatted = formatted.replace(/RDV/g, 'rendez-vous');
  formatted = formatted.replace(/€/g, 'euros');

  // Épeler les numéros de téléphone
  formatted = formatted.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g,
    '$1, $2, $3, $4, $5');

  return formatted;
}

// ============================================
// ELEVENLABS (optionnel, pour voix premium)
// ============================================

/**
 * Génère de l'audio avec ElevenLabs
 * Nécessite ELEVENLABS_API_KEY dans .env
 *
 * @param {string} text - Texte à convertir
 * @param {string} voiceId - ID de la voix ElevenLabs
 * @returns {Buffer} - Audio MP3
 */
async function generateWithElevenLabs(text, voiceId = 'EXAVITQu4vr4xnSDxMaL') {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY non configurée');
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    })
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs error: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Liste des voix ElevenLabs françaises recommandées
 */
const ELEVENLABS_VOICES = {
  // Voix prédéfinies multilingues
  rachel: 'EXAVITQu4vr4xnSDxMaL', // Femme, douce
  adam: '29vD33N1CtxCmqQRPOHJ',   // Homme, professionnel
  // Tu peux ajouter tes propres voix clonées ici
};

module.exports = {
  getVoiceConfig,
  formatTextForSpeech,
  generateWithElevenLabs,
  TWILIO_VOICES,
  ELEVENLABS_VOICES
};
