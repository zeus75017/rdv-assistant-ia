const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

exports.handler = async (event, context) => {
  const twiml = new VoiceResponse();

  try {
    // Récupérer les infos du client depuis l'URL
    const clientInfo = JSON.parse(decodeURIComponent(
      event.queryStringParameters.clientInfo || '{}'
    ));

    const { prenom, nom, entreprise, motif, disponibilites } = clientInfo;

    // Message d'introduction (l'IA se présente)
    const introduction = `Bonjour, je suis l'assistant virtuel qui appelle de la part de ${prenom} ${nom}.
    Je souhaiterais prendre un rendez-vous pour une ${motif === 'consultation' ? 'consultation' : motif === 'urgence' ? 'urgence' : motif === 'suivi' ? 'visite de suivi' : 'demande'}.
    Est-ce possible ?`;

    twiml.say({
      language: 'fr-FR',
      voice: 'Polly.Lea'
    }, introduction);

    // Écouter la réponse
    twiml.gather({
      input: 'speech',
      language: 'fr-FR',
      speechTimeout: 'auto',
      action: `/.netlify/functions/outbound-gather?clientInfo=${encodeURIComponent(JSON.stringify(clientInfo))}&step=1`,
      method: 'POST'
    });

    // Si pas de réponse
    twiml.say({
      language: 'fr-FR',
      voice: 'Polly.Lea'
    }, 'Allô ? Vous m\'entendez ?');

    twiml.redirect(`/.netlify/functions/outbound-voice?clientInfo=${encodeURIComponent(JSON.stringify(clientInfo))}`);

  } catch (error) {
    console.error('Erreur:', error);

    twiml.say({
      language: 'fr-FR',
      voice: 'Polly.Lea'
    }, 'Excusez-moi, je rencontre un problème technique. Je rappellerai plus tard.');

    twiml.hangup();
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/xml'
    },
    body: twiml.toString()
  };
};
