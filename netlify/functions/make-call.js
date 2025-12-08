const twilio = require('twilio');

// Client Twilio
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.handler = async (event, context) => {
  // Vérifier la méthode
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Méthode non autorisée' })
    };
  }

  try {
    // Parser les données du formulaire
    const data = JSON.parse(event.body);

    const {
      prenom,
      nom,
      telephone,
      entreprise,
      numero_entreprise,
      motif,
      details,
      disponibilites
    } = data;

    // Valider les données
    if (!prenom || !nom || !telephone || !numero_entreprise) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Données manquantes' })
      };
    }

    // Stocker les infos du client dans l'URL (pour les récupérer pendant l'appel)
    const clientInfo = encodeURIComponent(JSON.stringify({
      prenom,
      nom,
      telephone,
      entreprise,
      motif,
      details,
      disponibilites
    }));

    // URL de base (sera remplacée par l'URL Netlify en production)
    const baseUrl = process.env.URL || 'https://ton-site.netlify.app';

    // Lancer l'appel
    const call = await client.calls.create({
      to: numero_entreprise,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: `${baseUrl}/.netlify/functions/outbound-voice?clientInfo=${clientInfo}`,
      statusCallback: `${baseUrl}/.netlify/functions/call-status?clientPhone=${encodeURIComponent(telephone)}`,
      statusCallbackEvent: ['completed', 'failed', 'no-answer', 'busy']
    });

    console.log('📞 Appel lancé:', call.sid);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        callSid: call.sid,
        message: 'Appel en cours'
      })
    };

  } catch (error) {
    console.error('Erreur:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
