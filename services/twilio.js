const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;
const { generateAIResponse } = require('./ai');
const { SYSTEM_PROMPT } = require('../config/prompts');

// Client Twilio pour envoyer des SMS
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Stockage des conversations en cours (en mémoire pour le prototype)
const conversations = new Map();

/**
 * Gère un appel entrant
 */
function handleIncomingCall(callData) {
  const twiml = new VoiceResponse();
  const callSid = callData.CallSid;
  const from = callData.From;

  // Initialiser la conversation
  conversations.set(callSid, {
    from,
    messages: [],
    startTime: new Date()
  });

  // Message d'accueil
  twiml.say({
    language: 'fr-FR',
    voice: 'Polly.Lea' // Voix française naturelle
  }, `Bonjour et bienvenue chez ${process.env.BUSINESS_NAME || 'notre entreprise'}. Comment puis-je vous aider ?`);

  // Écouter la réponse de l'appelant
  const gather = twiml.gather({
    input: 'speech',
    language: 'fr-FR',
    speechTimeout: 'auto',
    action: '/voice/gather',
    method: 'POST'
  });

  // Si pas de réponse après 5 secondes
  twiml.say({
    language: 'fr-FR',
    voice: 'Polly.Lea'
  }, 'Je n\'ai pas entendu votre réponse. Pouvez-vous répéter ?');

  twiml.redirect('/voice/incoming');

  return twiml.toString();
}

/**
 * Traite ce que dit l'appelant et génère une réponse IA
 */
async function handleGather(gatherData) {
  const twiml = new VoiceResponse();
  const callSid = gatherData.CallSid;
  const speechResult = gatherData.SpeechResult;
  const confidence = gatherData.Confidence;

  console.log(`🗣️ Appelant dit: "${speechResult}" (confiance: ${confidence})`);

  // Récupérer l'historique de conversation
  let conversation = conversations.get(callSid) || { messages: [] };

  // Ajouter le message de l'utilisateur
  conversation.messages.push({
    role: 'user',
    content: speechResult
  });

  try {
    // Générer la réponse IA
    const aiResponse = await generateAIResponse(conversation.messages);

    // Ajouter la réponse à l'historique
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse.text
    });

    // Sauvegarder la conversation
    conversations.set(callSid, conversation);

    // Vérifier les actions spéciales
    if (aiResponse.action === 'transfer') {
      // Transférer l'appel
      twiml.say({
        language: 'fr-FR',
        voice: 'Polly.Lea'
      }, 'Je vous transfère vers un conseiller. Veuillez patienter.');

      twiml.redirect('/voice/transfer');
      return twiml.toString();
    }

    if (aiResponse.action === 'sms') {
      // Envoyer un SMS
      await sendSMS(gatherData.From, aiResponse.smsContent);
    }

    if (aiResponse.action === 'hangup') {
      // Terminer l'appel
      twiml.say({
        language: 'fr-FR',
        voice: 'Polly.Lea'
      }, aiResponse.text);

      twiml.hangup();
      return twiml.toString();
    }

    // Réponse normale
    twiml.say({
      language: 'fr-FR',
      voice: 'Polly.Lea'
    }, aiResponse.text);

    // Continuer à écouter
    const gather = twiml.gather({
      input: 'speech',
      language: 'fr-FR',
      speechTimeout: 'auto',
      action: '/voice/gather',
      method: 'POST'
    });

    // Si pas de réponse
    twiml.say({
      language: 'fr-FR',
      voice: 'Polly.Lea'
    }, 'Avez-vous d\'autres questions ?');

    twiml.redirect('/voice/incoming');

  } catch (error) {
    console.error('Erreur IA:', error);

    twiml.say({
      language: 'fr-FR',
      voice: 'Polly.Lea'
    }, 'Excusez-moi, j\'ai eu un petit problème. Pouvez-vous répéter votre question ?');

    twiml.redirect('/voice/incoming');
  }

  return twiml.toString();
}

/**
 * Transfère l'appel vers un humain
 */
function handleTransfer() {
  const twiml = new VoiceResponse();

  twiml.dial({
    callerId: process.env.TWILIO_PHONE_NUMBER
  }, process.env.TRANSFER_PHONE);

  return twiml.toString();
}

/**
 * Envoie un SMS
 */
async function sendSMS(to, message) {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    console.log(`📱 SMS envoyé à ${to}: ${result.sid}`);
    return result;
  } catch (error) {
    console.error('Erreur envoi SMS:', error);
    throw error;
  }
}

/**
 * Récupère les infos d'une conversation
 */
function getConversation(callSid) {
  return conversations.get(callSid);
}

/**
 * Nettoie les vieilles conversations (à appeler périodiquement)
 */
function cleanupConversations() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  for (const [callSid, conv] of conversations) {
    if (conv.startTime < oneHourAgo) {
      conversations.delete(callSid);
    }
  }
}

// Nettoyage automatique toutes les heures
setInterval(cleanupConversations, 60 * 60 * 1000);

module.exports = {
  handleIncomingCall,
  handleGather,
  handleTransfer,
  sendSMS,
  getConversation
};
