/**
 * Service IA - Utilise Claude (Anthropic) pour générer les réponses
 */

const Anthropic = require('@anthropic-ai/sdk');
const { SYSTEM_PROMPT, detectIntent } = require('../config/prompts');

// Client Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Génère une réponse IA basée sur la conversation
 *
 * @param {Array} messages - Historique de la conversation [{role, content}]
 * @returns {Object} - { text: string, action: string|null, smsContent: string|null }
 */
async function generateAIResponse(messages) {
  try {
    // Formater les messages pour Claude
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Appeler Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Rapide et économique pour les appels
      max_tokens: 300, // Réponses courtes pour le téléphone
      system: SYSTEM_PROMPT,
      messages: formattedMessages
    });

    const responseText = response.content[0].text;

    // Analyser la réponse pour détecter les actions
    const action = parseAction(responseText);

    return {
      text: cleanResponse(responseText),
      action: action.type,
      smsContent: action.smsContent,
      appointmentData: action.appointmentData
    };

  } catch (error) {
    console.error('Erreur Claude:', error);

    // Réponse de secours
    return {
      text: "Excusez-moi, je rencontre un petit problème technique. Pouvez-vous répéter votre demande ?",
      action: null
    };
  }
}

/**
 * Analyse la réponse pour détecter les actions spéciales
 * L'IA inclut des balises comme [TRANSFER], [SMS:contenu], [HANGUP]
 */
function parseAction(responseText) {
  const result = {
    type: null,
    smsContent: null,
    appointmentData: null
  };

  // Détecter transfert
  if (responseText.includes('[TRANSFER]') || responseText.includes('[TRANSFERT]')) {
    result.type = 'transfer';
  }

  // Détecter envoi SMS
  const smsMatch = responseText.match(/\[SMS:(.*?)\]/s);
  if (smsMatch) {
    result.type = 'sms';
    result.smsContent = smsMatch[1].trim();
  }

  // Détecter fin d'appel
  if (responseText.includes('[HANGUP]') || responseText.includes('[FIN]')) {
    result.type = 'hangup';
  }

  // Détecter prise de RDV
  const rdvMatch = responseText.match(/\[RDV:(.*?)\]/s);
  if (rdvMatch) {
    result.type = 'appointment';
    try {
      result.appointmentData = JSON.parse(rdvMatch[1]);
    } catch (e) {
      result.appointmentData = { raw: rdvMatch[1] };
    }
  }

  return result;
}

/**
 * Nettoie la réponse en enlevant les balises d'action
 */
function cleanResponse(responseText) {
  return responseText
    .replace(/\[TRANSFER\]/gi, '')
    .replace(/\[TRANSFERT\]/gi, '')
    .replace(/\[SMS:.*?\]/gs, '')
    .replace(/\[HANGUP\]/gi, '')
    .replace(/\[FIN\]/gi, '')
    .replace(/\[RDV:.*?\]/gs, '')
    .trim();
}

/**
 * Génère un résumé de la conversation pour envoyer par email/SMS
 */
async function generateConversationSummary(messages) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      system: "Tu es un assistant qui résume des conversations téléphoniques. Fais un résumé court et professionnel en français.",
      messages: [{
        role: 'user',
        content: `Résume cette conversation téléphonique:\n\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}`
      }]
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Erreur résumé:', error);
    return 'Résumé non disponible';
  }
}

/**
 * Analyse le sentiment de l'appelant (pour détecter urgence/frustration)
 */
async function analyzeSentiment(text) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 50,
      system: "Analyse le sentiment. Réponds uniquement par: POSITIF, NEUTRE, NEGATIF, ou URGENT",
      messages: [{
        role: 'user',
        content: text
      }]
    });

    const sentiment = response.content[0].text.trim().toUpperCase();

    return {
      sentiment,
      isUrgent: sentiment === 'URGENT',
      needsHuman: sentiment === 'NEGATIF' || sentiment === 'URGENT'
    };
  } catch (error) {
    return { sentiment: 'NEUTRE', isUrgent: false, needsHuman: false };
  }
}

module.exports = {
  generateAIResponse,
  generateConversationSummary,
  analyzeSentiment
};
