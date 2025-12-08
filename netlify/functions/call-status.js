const twilio = require('twilio');

// Client Twilio pour envoyer des SMS
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.handler = async (event, context) => {
  try {
    // Parser les données POST de Twilio
    const params = new URLSearchParams(event.body);
    const callStatus = params.get('CallStatus');
    const callSid = params.get('CallSid');
    const callDuration = params.get('CallDuration');

    // Récupérer le téléphone du client
    const clientPhone = decodeURIComponent(
      event.queryStringParameters.clientPhone || ''
    );

    console.log(`📊 Statut appel ${callSid}: ${callStatus} (durée: ${callDuration}s)`);

    // Envoyer un SMS selon le statut
    if (clientPhone) {
      let message = '';

      switch (callStatus) {
        case 'completed':
          // L'appel s'est terminé normalement
          // Le SMS de confirmation est déjà envoyé par outbound-gather
          console.log('Appel terminé normalement');
          break;

        case 'busy':
          message = `📞 Ligne occupée\n\nLe numéro était occupé. Nous réessaierons dans quelques minutes.\n\n- RDV Assistant`;
          break;

        case 'no-answer':
          message = `📞 Pas de réponse\n\nPersonne n'a répondu à notre appel. Nous réessaierons plus tard.\n\n- RDV Assistant`;
          break;

        case 'failed':
          message = `❌ Appel échoué\n\nL'appel n'a pas pu être effectué. Vérifiez le numéro et réessayez.\n\n- RDV Assistant`;
          break;

        case 'canceled':
          message = `🚫 Appel annulé\n\nL'appel a été annulé.\n\n- RDV Assistant`;
          break;
      }

      // Envoyer le SMS si nécessaire
      if (message) {
        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: clientPhone
        });
        console.log('📱 SMS de statut envoyé');
      }
    }

    return {
      statusCode: 200,
      body: 'OK'
    };

  } catch (error) {
    console.error('Erreur call-status:', error);

    return {
      statusCode: 500,
      body: 'Error'
    };
  }
};
