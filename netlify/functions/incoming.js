const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

exports.handler = async (event, context) => {
  // Parser les données POST de Twilio
  const params = new URLSearchParams(event.body);
  const callData = Object.fromEntries(params);

  console.log('📞 Appel entrant de:', callData.From);

  const twiml = new VoiceResponse();

  // Message d'accueil
  twiml.say({
    language: 'fr-FR',
    voice: 'Polly.Lea'
  }, `Bonjour et bienvenue chez ${process.env.BUSINESS_NAME || 'notre entreprise'}. Comment puis-je vous aider ?`);

  // Écouter la réponse de l'appelant
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
  }, 'Je n\'ai pas entendu votre réponse. Pouvez-vous répéter ?');

  twiml.redirect('/voice/incoming');

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/xml'
    },
    body: twiml.toString()
  };
};
