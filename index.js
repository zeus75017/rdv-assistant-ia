const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
const VoiceResponse = twilio.twiml.VoiceResponse;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Client Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Client Anthropic (Claude)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// ============================================
// PAGE D'ACCUEIL
// ============================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// API : LANCER UN APPEL
// ============================================
app.post('/api/make-call', async (req, res) => {
  try {
    const {
      prenom,
      nom,
      telephone,
      entreprise,
      numero_entreprise,
      motif,
      details,
      disponibilites
    } = req.body;

    // Valider les données
    if (!prenom || !nom || !numero_entreprise) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    // Stocker les infos du client dans l'URL
    const clientInfo = encodeURIComponent(JSON.stringify({
      prenom,
      nom,
      telephone,
      entreprise,
      motif,
      details,
      disponibilites
    }));

    // URL de base (Render fournit RENDER_EXTERNAL_URL)
    const baseUrl = process.env.RENDER_EXTERNAL_URL
      || process.env.BASE_URL
      || `https://rdv-assistant-ia.onrender.com`;

    console.log('📞 Lancement appel vers:', numero_entreprise);
    console.log('🌐 Base URL:', baseUrl);

    // Lancer l'appel
    const call = await twilioClient.calls.create({
      to: numero_entreprise,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: `${baseUrl}/voice/outbound?clientInfo=${clientInfo}`,
      statusCallback: `${baseUrl}/voice/status`,
      statusCallbackEvent: ['completed', 'failed', 'no-answer', 'busy']
    });

    console.log('✅ Appel lancé:', call.sid);

    res.json({
      success: true,
      callSid: call.sid,
      message: 'Appel en cours'
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// TWILIO : PREMIER MESSAGE (appel sortant)
// ============================================
app.post('/voice/outbound', (req, res) => {
  const twiml = new VoiceResponse();

  try {
    const clientInfo = JSON.parse(decodeURIComponent(
      req.query.clientInfo || '{}'
    ));

    const { prenom, nom, motif } = clientInfo;

    console.log('📞 Appel connecté pour:', prenom, nom);

    // Message d'introduction
    const motifTexte = motif === 'consultation' ? 'une consultation'
      : motif === 'urgence' ? 'une urgence'
      : motif === 'suivi' ? 'une visite de suivi'
      : 'un rendez-vous';

    twiml.say({
      language: 'fr-FR',
      voice: 'Polly.Lea'
    }, `Bonjour, j'appelle de la part de ${prenom} ${nom} pour lui prendre un rendez-vous pour ${motifTexte}. Auriez-vous des disponibilités ?`);

    // Écouter la réponse
    twiml.gather({
      input: 'speech',
      language: 'fr-FR',
      speechTimeout: 'auto',
      action: `/voice/conversation?clientInfo=${encodeURIComponent(JSON.stringify(clientInfo))}&step=1`,
      method: 'POST'
    });

    // Si pas de réponse
    twiml.say({
      language: 'fr-FR',
      voice: 'Polly.Lea'
    }, 'Allô ? Vous m\'entendez ?');

    twiml.redirect(`/voice/outbound?clientInfo=${encodeURIComponent(JSON.stringify(clientInfo))}`);

  } catch (error) {
    console.error('Erreur outbound:', error);
    twiml.say({
      language: 'fr-FR',
      voice: 'Polly.Lea'
    }, 'Excusez-moi, problème technique. Au revoir.');
    twiml.hangup();
  }

  res.type('text/xml').send(twiml.toString());
});

// ============================================
// TWILIO : CONVERSATION IA
// ============================================
app.post('/voice/conversation', async (req, res) => {
  const twiml = new VoiceResponse();

  try {
    const speechResult = req.body.SpeechResult || '';
    const clientInfo = JSON.parse(decodeURIComponent(req.query.clientInfo || '{}'));
    const step = parseInt(req.query.step || '1');

    const { prenom, nom, motif, details, disponibilites } = clientInfo;

    console.log(`🗣️ [Step ${step}] Interlocuteur dit: "${speechResult}"`);

    // Prompt pour Claude - SIMPLE ET DIRECT
    const systemPrompt = `Tu es au téléphone avec une secrétaire. Tu veux obtenir un RDV pour ${prenom} ${nom}.
Motif: ${motif}. Ses disponibilités: ${disponibilites}.

OBJECTIF: Obtenir une DATE et HEURE précise de RDV.

RÈGLES:
- Réponds en 1 phrase courte
- Tu n'as PAS encore de RDV tant qu'on ne t'a pas donné une date/heure précise
- "Oui" ou "on a de la place" = demande QUEL créneau est disponible
- Continue jusqu'à avoir une date et heure exacte (ex: "mardi 14h", "le 15 à 10h")

UNIQUEMENT quand tu as une date+heure précise, ajoute [RDV_OK:date et heure].
Si refus définitif, ajoute [ECHEC:raison].
Si on te dit de rappeler, ajoute [RAPPEL:quand].

NE DIS JAMAIS "merci au revoir" tant que tu n'as pas [RDV_OK].`;

    // Appeler Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 60,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: speechResult
      }]
    });

    let aiResponse = response.content[0].text;
    console.log('🤖 IA répond:', aiResponse);

    // Vérifier RDV confirmé
    const rdvMatch = aiResponse.match(/\[RDV_OK:(.*?)\]/);
    if (rdvMatch) {
      const rdvDetails = rdvMatch[1];
      aiResponse = aiResponse.replace(/\[RDV_OK:.*?\]/, '').trim();

      console.log(`✅ RDV CONFIRMÉ: ${prenom} ${nom} - ${rdvDetails}`);

      twiml.say({
        language: 'fr-FR',
        voice: 'Polly.Lea'
      }, aiResponse + ' Merci beaucoup, bonne journée !');

      twiml.hangup();
      return res.type('text/xml').send(twiml.toString());
    }

    // Vérifier échec
    const echecMatch = aiResponse.match(/\[ECHEC:(.*?)\]/);
    if (echecMatch) {
      aiResponse = aiResponse.replace(/\[ECHEC:.*?\]/, '').trim();
      console.log(`❌ ÉCHEC: ${echecMatch[1]}`);

      twiml.say({
        language: 'fr-FR',
        voice: 'Polly.Lea'
      }, aiResponse + ' Merci quand même, au revoir.');

      twiml.hangup();
      return res.type('text/xml').send(twiml.toString());
    }

    // Vérifier rappel
    const rappelMatch = aiResponse.match(/\[RAPPEL:(.*?)\]/);
    if (rappelMatch) {
      aiResponse = aiResponse.replace(/\[RAPPEL:.*?\]/, '').trim();
      console.log(`📞 À RAPPELER: ${rappelMatch[1]}`);

      twiml.say({
        language: 'fr-FR',
        voice: 'Polly.Lea'
      }, aiResponse + ' Merci, au revoir.');

      twiml.hangup();
      return res.type('text/xml').send(twiml.toString());
    }

    // Réponse normale - continuer
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
        action: `/voice/conversation?clientInfo=${encodeURIComponent(JSON.stringify(clientInfo))}&step=${step + 1}`,
        method: 'POST'
      });

      twiml.say({
        language: 'fr-FR',
        voice: 'Polly.Lea'
      }, 'Allô ?');
    } else {
      twiml.say({
        language: 'fr-FR',
        voice: 'Polly.Lea'
      }, 'Je vous remercie, je rappellerai. Au revoir.');
      twiml.hangup();
    }

  } catch (error) {
    console.error('Erreur conversation:', error);
    twiml.say({
      language: 'fr-FR',
      voice: 'Polly.Lea'
    }, 'Excusez-moi, je dois raccrocher. Au revoir.');
    twiml.hangup();
  }

  res.type('text/xml').send(twiml.toString());
});

// ============================================
// TWILIO : STATUT APPEL
// ============================================
app.post('/voice/status', (req, res) => {
  const { CallStatus, CallSid, CallDuration } = req.body;
  console.log(`📊 Appel ${CallSid}: ${CallStatus} (${CallDuration || 0}s)`);
  res.sendStatus(200);
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// DÉMARRAGE
// ============================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
🚀 RDV Assistant IA démarré !

📍 Port: ${PORT}
🌐 URL: http://localhost:${PORT}

📞 Endpoints:
   POST /api/make-call     - Lancer un appel
   POST /voice/outbound    - Webhook Twilio (sortant)
   POST /voice/conversation - Webhook Twilio (conversation)
  `);
});
