const twilio = require('twilio');
const Anthropic = require('@anthropic-ai/sdk');
const VoiceResponse = twilio.twiml.VoiceResponse;

// Client Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Historique des conversations (en mémoire - pour production utiliser une base de données)
const conversations = {};

exports.handler = async (event, context) => {
  const twiml = new VoiceResponse();

  try {
    // Récupérer les paramètres
    const params = new URLSearchParams(event.body);
    const speechResult = params.get('SpeechResult') || '';
    const callSid = params.get('CallSid');

    const clientInfo = JSON.parse(decodeURIComponent(
      event.queryStringParameters.clientInfo || '{}'
    ));
    const step = parseInt(event.queryStringParameters.step || '1');

    const { prenom, nom, motif, details, disponibilites, telephone } = clientInfo;

    console.log(`🗣️ Secrétaire dit: "${speechResult}"`);

    // Construire le prompt pour Claude
    const systemPrompt = `Tu es un assistant virtuel qui appelle un cabinet/entreprise pour prendre rendez-vous.

INFORMATIONS DU CLIENT:
- Nom: ${prenom} ${nom}
- Motif: ${motif}
- Détails: ${details || 'Aucun'}
- Disponibilités: ${disponibilites}

TON OBJECTIF:
1. Prendre un rendez-vous pour le client
2. Obtenir la date et l'heure exactes
3. Confirmer le rendez-vous

RÈGLES:
- Réponds en français, phrases TRÈS COURTES (max 2 phrases)
- Sois poli et professionnel
- Ne révèle JAMAIS que tu es une IA
- Tu représentes le client ${prenom} ${nom}

ACTIONS SPÉCIALES (ajoute ces balises si nécessaire):
- [RDV_CONFIRME:date et heure] - Quand le RDV est confirmé
- [ECHEC:raison] - Si impossible de prendre RDV
- [RAPPELER:moment] - Si on doit rappeler plus tard

EXEMPLES:
Secrétaire: "Cabinet dentaire bonjour"
Toi: "Bonjour, j'appelle de la part de ${prenom} ${nom} pour prendre un rendez-vous pour une consultation. Est-ce possible ?"

Secrétaire: "Oui, vous avez des préférences de date ?"
Toi: "${prenom} est disponible ${disponibilites}. Qu'avez-vous de disponible ?"

Secrétaire: "J'ai mardi 14h"
Toi: "Mardi 14h c'est parfait pour ${prenom}. Pouvez-vous confirmer ce rendez-vous ? [RDV_CONFIRME:mardi 14h]"`;

    // Appeler Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 150,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `La personne au téléphone dit: "${speechResult}"`
      }]
    });

    let aiResponse = response.content[0].text;
    console.log('🤖 IA répond:', aiResponse);

    // Vérifier si RDV confirmé
    const rdvMatch = aiResponse.match(/\[RDV_CONFIRME:(.*?)\]/);
    if (rdvMatch) {
      const rdvDetails = rdvMatch[1];
      aiResponse = aiResponse.replace(/\[RDV_CONFIRME:.*?\]/, '').trim();

      // Dire la confirmation
      twiml.say({
        language: 'fr-FR',
        voice: 'Polly.Lea'
      }, aiResponse + ' Merci beaucoup, bonne journée !');

      // Envoyer SMS au client (désactivé en mode trial)
      // await sendConfirmationSMS(telephone, prenom, clientInfo.entreprise, rdvDetails);
      console.log(`✅ RDV CONFIRMÉ: ${prenom} ${nom} - ${clientInfo.entreprise} - ${rdvDetails}`);

      twiml.hangup();

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/xml' },
        body: twiml.toString()
      };
    }

    // Vérifier si échec
    const echecMatch = aiResponse.match(/\[ECHEC:(.*?)\]/);
    if (echecMatch) {
      aiResponse = aiResponse.replace(/\[ECHEC:.*?\]/, '').trim();

      twiml.say({
        language: 'fr-FR',
        voice: 'Polly.Lea'
      }, aiResponse + ' Je vous remercie, au revoir.');

      // Envoyer SMS d'échec au client (désactivé en mode trial)
      // await sendFailureSMS(telephone, prenom, clientInfo.entreprise, echecMatch[1]);
      console.log(`❌ ÉCHEC RDV: ${prenom} ${nom} - ${echecMatch[1]}`);

      twiml.hangup();

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/xml' },
        body: twiml.toString()
      };
    }

    // Vérifier si rappeler
    const rappelMatch = aiResponse.match(/\[RAPPELER:(.*?)\]/);
    if (rappelMatch) {
      aiResponse = aiResponse.replace(/\[RAPPELER:.*?\]/, '').trim();

      twiml.say({
        language: 'fr-FR',
        voice: 'Polly.Lea'
      }, aiResponse + ' Merci, au revoir.');

      // await sendRappelSMS(telephone, prenom, clientInfo.entreprise, rappelMatch[1]);
      console.log(`📞 À RAPPELER: ${prenom} ${nom} - ${rappelMatch[1]}`);

      twiml.hangup();

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/xml' },
        body: twiml.toString()
      };
    }

    // Réponse normale - continuer la conversation
    twiml.say({
      language: 'fr-FR',
      voice: 'Polly.Lea'
    }, aiResponse);

    // Continuer à écouter (max 10 échanges)
    if (step < 10) {
      twiml.gather({
        input: 'speech',
        language: 'fr-FR',
        speechTimeout: 'auto',
        action: `/.netlify/functions/outbound-gather?clientInfo=${encodeURIComponent(JSON.stringify(clientInfo))}&step=${step + 1}`,
        method: 'POST'
      });

      twiml.say({
        language: 'fr-FR',
        voice: 'Polly.Lea'
      }, 'Allô ?');

      twiml.redirect(`/.netlify/functions/outbound-gather?clientInfo=${encodeURIComponent(JSON.stringify(clientInfo))}&step=${step + 1}`);
    } else {
      // Trop d'échanges, terminer
      twiml.say({
        language: 'fr-FR',
        voice: 'Polly.Lea'
      }, 'Je vous remercie pour votre temps. Je rappellerai plus tard. Au revoir.');

      twiml.hangup();
    }

  } catch (error) {
    console.error('Erreur:', error);

    twiml.say({
      language: 'fr-FR',
      voice: 'Polly.Lea'
    }, 'Excusez-moi, je dois vous laisser. Je rappellerai plus tard.');

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

// Fonctions d'envoi de SMS
async function sendConfirmationSMS(to, prenom, entreprise, rdvDetails) {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  try {
    await client.messages.create({
      body: `✅ RDV confirmé !\n\nBonjour ${prenom},\nVotre rendez-vous chez ${entreprise} est confirmé pour ${rdvDetails}.\n\n- RDV Assistant`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    console.log('📱 SMS de confirmation envoyé');
  } catch (error) {
    console.error('Erreur SMS:', error);
  }
}

async function sendFailureSMS(to, prenom, entreprise, raison) {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  try {
    await client.messages.create({
      body: `❌ RDV non disponible\n\nBonjour ${prenom},\nNous n'avons pas pu obtenir de RDV chez ${entreprise}.\nRaison: ${raison}\n\n- RDV Assistant`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
  } catch (error) {
    console.error('Erreur SMS:', error);
  }
}

async function sendRappelSMS(to, prenom, entreprise, moment) {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  try {
    await client.messages.create({
      body: `📞 À rappeler\n\nBonjour ${prenom},\n${entreprise} nous a demandé de rappeler ${moment}.\nNous réessaierons.\n\n- RDV Assistant`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
  } catch (error) {
    console.error('Erreur SMS:', error);
  }
}
