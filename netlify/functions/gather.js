const twilio = require('twilio');
const Anthropic = require('@anthropic-ai/sdk');
const VoiceResponse = twilio.twiml.VoiceResponse;

// Client Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Prompt système pour l'IA
const SYSTEM_PROMPT = `Tu es l'assistant téléphonique virtuel de ${process.env.BUSINESS_NAME || "l'entreprise"}.

RÈGLES IMPORTANTES:
1. Tu parles UNIQUEMENT en français
2. Tes réponses doivent être TRÈS COURTES (1-2 phrases max) car elles seront lues à voix haute
3. Sois poli, professionnel et chaleureux
4. Ne dis jamais que tu es une IA

TES CAPACITÉS:
- Répondre aux questions sur l'entreprise
- Prendre des rendez-vous
- Noter des messages
- Transférer vers un humain si nécessaire

ACTIONS SPÉCIALES (inclus ces balises si approprié):
- [TRANSFER] - Pour transférer à un humain
- [FIN] - Pour terminer l'appel

INFORMATIONS:
- Nom: ${process.env.BUSINESS_NAME || "Notre Entreprise"}
- Horaires: Lundi-Vendredi, 9h-18h`;

exports.handler = async (event, context) => {
  const twiml = new VoiceResponse();

  try {
    // Parser les données POST
    const params = new URLSearchParams(event.body);
    const gatherData = Object.fromEntries(params);

    const speechResult = gatherData.SpeechResult;
    console.log('🗣️ Appelant dit:', speechResult);

    // Appeler Claude pour générer une réponse
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 150,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: speechResult
      }]
    });

    let aiResponse = response.content[0].text;
    console.log('🤖 IA répond:', aiResponse);

    // Vérifier les actions spéciales
    if (aiResponse.includes('[TRANSFER]')) {
      aiResponse = aiResponse.replace('[TRANSFER]', '').trim();
      twiml.say({
        language: 'fr-FR',
        voice: 'Polly.Lea'
      }, aiResponse || 'Je vous transfère vers un conseiller.');

      twiml.dial({
        callerId: process.env.TWILIO_PHONE_NUMBER
      }, process.env.TRANSFER_PHONE || '+33123456789');

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/xml' },
        body: twiml.toString()
      };
    }

    if (aiResponse.includes('[FIN]')) {
      aiResponse = aiResponse.replace('[FIN]', '').trim();
      twiml.say({
        language: 'fr-FR',
        voice: 'Polly.Lea'
      }, aiResponse || 'Merci de votre appel. Au revoir !');

      twiml.hangup();

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/xml' },
        body: twiml.toString()
      };
    }

    // Réponse normale
    twiml.say({
      language: 'fr-FR',
      voice: 'Polly.Lea'
    }, aiResponse);

    // Continuer à écouter
    twiml.gather({
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
    console.error('Erreur:', error);

    twiml.say({
      language: 'fr-FR',
      voice: 'Polly.Lea'
    }, 'Excusez-moi, j\'ai eu un petit problème. Pouvez-vous répéter ?');

    twiml.redirect('/voice/incoming');
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/xml'
    },
    body: twiml.toString()
  };
};
