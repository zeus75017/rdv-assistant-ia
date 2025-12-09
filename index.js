require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const twilio = require('twilio');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

const VoiceResponse = twilio.twiml.VoiceResponse;

// Stockage des connexions socket par userId
const userSockets = new Map();

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Middleware d'authentification
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

// ============================================
// SOCKET.IO
// ============================================
io.on('connection', (socket) => {
  console.log('Client connecte:', socket.id);

  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userSockets.set(decoded.id, socket);
      socket.userId = decoded.id;
      console.log(`Utilisateur ${decoded.id} authentifie via socket`);
    } catch (error) {
      console.log('Erreur auth socket:', error.message);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      userSockets.delete(socket.userId);
    }
    console.log('Client deconnecte:', socket.id);
  });
});

// Fonction pour envoyer une notification en temps reel
function sendNotification(userId, notification) {
  const socket = userSockets.get(userId);
  if (socket) {
    socket.emit('notification', notification);
  }
}

// Fonction pour mettre a jour le statut d'un appel en temps reel
function sendCallUpdate(userId, callData) {
  const socket = userSockets.get(userId);
  if (socket) {
    socket.emit('call_update', callData);
  }
}

// ============================================
// CLIENTS API
// ============================================
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// ============================================
// PAGES STATIQUES
// ============================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// ============================================
// API AUTHENTIFICATION
// ============================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { prenom, nom, email, telephone, entreprise, password, plan } = req.body;

    if (!prenom || !nom || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est deja utilise' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.createUser({
      prenom,
      nom,
      email,
      telephone,
      entreprise,
      password: hashedPassword,
      plan: plan || 'starter'
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`Nouvel utilisateur: ${prenom} ${nom} (${email})`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        entreprise: user.entreprise,
        plan: user.plan,
        creditsAppels: user.credits_appels
      }
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`Connexion: ${user.prenom} ${user.nom}`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        entreprise: user.entreprise,
        plan: user.plan,
        creditsAppels: user.credits_appels
      }
    });

  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouve' });
    }

    res.json({
      id: user.id,
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      telephone: user.telephone,
      entreprise: user.entreprise,
      plan: user.plan,
      creditsAppels: user.credits_appels
    });
  } catch (error) {
    console.error('Erreur profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// API APPELS (protegee)
// ============================================
app.post('/api/make-call', authMiddleware, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);

    if (user.credits_appels <= 0) {
      return res.status(403).json({ error: 'Plus de credits disponibles' });
    }

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

    if (!prenom || !nom || !numero_entreprise) {
      return res.status(400).json({ error: 'Donnees manquantes' });
    }

    const baseUrl = process.env.RENDER_EXTERNAL_URL || process.env.BASE_URL;

    if (!baseUrl) {
      return res.status(500).json({ error: 'Configuration serveur manquante (BASE_URL)' });
    }

    console.log('Lancement appel vers:', numero_entreprise);

    const clientInfo = encodeURIComponent(JSON.stringify({
      prenom,
      nom,
      telephone,
      entreprise,
      motif,
      details,
      disponibilites,
      userId: user.id
    }));

    const call = await twilioClient.calls.create({
      to: numero_entreprise,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: `${baseUrl}/voice/outbound?clientInfo=${clientInfo}`,
      statusCallback: `${baseUrl}/voice/status`,
      statusCallbackEvent: ['completed', 'failed', 'no-answer', 'busy'],
      record: true,
      recordingStatusCallback: `${baseUrl}/voice/recording-status`,
      recordingStatusCallbackEvent: ['completed']
    });
    const callSid = call.sid;

    await db.createCall({
      callSid,
      userId: user.id,
      clientPrenom: prenom,
      clientNom: nom,
      entreprise,
      numeroEntreprise: numero_entreprise,
      motif,
      details
    });

    // Notification d'appel demarre
    const notification = await db.createNotification({
      userId: user.id,
      type: 'call_started',
      title: 'Appel demarre',
      message: `Appel vers ${entreprise} pour ${prenom} ${nom}`,
      data: { callSid, entreprise, clientPrenom: prenom, clientNom: nom }
    });
    sendNotification(user.id, notification);

    await db.updateUserCredits(user.id, user.credits_appels - 1);

    console.log('Appel lance:', callSid);

    res.json({
      success: true,
      callSid: callSid,
      message: 'Appel en cours',
      creditsRestants: user.credits_appels - 1
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Historique des appels avec filtres
app.get('/api/calls', authMiddleware, async (req, res) => {
  try {
    const { status, search } = req.query;
    const calls = await db.getCallsByUserId(req.user.id, { status, search });
    res.json(calls);
  } catch (error) {
    console.error('Erreur historique appels:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Detail d'un appel avec transcription
app.get('/api/calls/:callSid', authMiddleware, async (req, res) => {
  try {
    const call = await db.getCallByCallSid(req.params.callSid);
    if (!call || call.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Appel non trouve' });
    }
    res.json(call);
  } catch (error) {
    console.error('Erreur detail appel:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Historique des RDV
app.get('/api/appointments', authMiddleware, async (req, res) => {
  try {
    const appointments = await db.getAppointmentsByUserId(req.user.id);
    res.json(appointments);
  } catch (error) {
    console.error('Erreur historique RDV:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// API NOTIFICATIONS
// ============================================
app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await db.getNotificationsByUserId(req.user.id);
    res.json(notifications);
  } catch (error) {
    console.error('Erreur notifications:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    await db.markNotificationRead(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur mark read:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/notifications/read-all', authMiddleware, async (req, res) => {
  try {
    await db.markAllNotificationsRead(req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur mark all read:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// API RAPPELS PROGRAMMES
// ============================================
app.post('/api/schedule-recall', authMiddleware, async (req, res) => {
  try {
    const { callId, scheduledAt, clientPrenom, clientNom, entreprise, numeroEntreprise, motif, details, disponibilites } = req.body;

    const recall = await db.createScheduledRecall({
      userId: req.user.id,
      callId,
      scheduledAt: new Date(scheduledAt),
      clientPrenom,
      clientNom,
      entreprise,
      numeroEntreprise,
      motif,
      details,
      disponibilites
    });

    // Notification
    const notification = await db.createNotification({
      userId: req.user.id,
      type: 'recall_scheduled',
      title: 'Rappel programme',
      message: `Rappel programme pour ${clientPrenom} ${clientNom} le ${new Date(scheduledAt).toLocaleString('fr-FR')}`,
      data: { recallId: recall.id, scheduledAt }
    });
    sendNotification(req.user.id, notification);

    res.json({ success: true, recall });
  } catch (error) {
    console.error('Erreur programmation rappel:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/scheduled-recalls', authMiddleware, async (req, res) => {
  try {
    const recalls = await db.getScheduledRecallsByUserId(req.user.id);
    res.json(recalls);
  } catch (error) {
    console.error('Erreur liste rappels:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/scheduled-recalls/:id', authMiddleware, async (req, res) => {
  try {
    await db.updateRecallStatus(req.params.id, 'cancelled');
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur annulation rappel:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// API STATS AVANCEES
// ============================================
app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    const stats = await db.getUserStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('Erreur stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/stats/weekly', authMiddleware, async (req, res) => {
  try {
    const weeklyStats = await db.getWeeklyStats(req.user.id);
    res.json(weeklyStats);
  } catch (error) {
    console.error('Erreur stats hebdo:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/stats/success-rate', authMiddleware, async (req, res) => {
  try {
    const rate = await db.getSuccessRate(req.user.id);
    res.json({ rate });
  } catch (error) {
    console.error('Erreur taux succes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// API ENREGISTREMENTS
// ============================================
app.get('/api/calls/:callSid/recording', authMiddleware, async (req, res) => {
  try {
    const call = await db.getCallByCallSid(req.params.callSid);
    if (!call || call.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Appel non trouve' });
    }

    if (!call.recording_url) {
      return res.status(404).json({ error: 'Aucun enregistrement disponible' });
    }

    res.json({
      recording_url: call.recording_url,
      recording_sid: call.recording_sid
    });
  } catch (error) {
    console.error('Erreur recuperation enregistrement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Proxy pour l'audio Twilio (evite les problemes CORS)
app.get('/api/recording-audio/:callSid', authMiddleware, async (req, res) => {
  try {
    const call = await db.getCallByCallSid(req.params.callSid);
    if (!call || call.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Appel non trouve' });
    }

    if (!call.recording_url) {
      return res.status(404).json({ error: 'Aucun enregistrement disponible' });
    }

    // Rediriger vers l'URL Twilio avec authentification
    const recordingUrl = call.recording_url + '.mp3';
    res.redirect(recordingUrl);
  } catch (error) {
    console.error('Erreur proxy audio:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// TWILIO WEBHOOKS
// ============================================
app.post('/voice/outbound', async (req, res) => {
  const twiml = new VoiceResponse();

  try {
    const clientInfo = JSON.parse(decodeURIComponent(
      req.query.clientInfo || '{}'
    ));

    const { prenom, nom, motif, userId } = clientInfo;
    const callSid = req.body.CallSid;

    console.log('Appel connecte pour:', prenom, nom);

    // Enregistrer le debut de la transcription
    if (callSid && userId) {
      await db.appendCallTranscription(callSid, `[Debut de l'appel - ${new Date().toLocaleTimeString('fr-FR')}]`);
    }

    const motifTexte = motif === 'consultation' ? 'une consultation'
      : motif === 'urgence' ? 'une urgence'
      : motif === 'suivi' ? 'une visite de suivi'
      : 'un rendez-vous';

    let introMessage = `Bonjour, j'appelle pour prendre un rendez-vous pour ${prenom} ${nom}, pour ${motifTexte}.`;
    if (clientInfo.details) {
      introMessage += ` ${clientInfo.details}.`;
    }
    introMessage += ` Auriez-vous des disponibilites ?`;

    // Enregistrer dans la transcription
    if (callSid) {
      await db.appendCallTranscription(callSid, `[IA] ${introMessage}`);
    }

    twiml.say({
      language: 'fr-FR',
      voice: 'Polly.Lea'
    }, introMessage);

    twiml.gather({
      input: 'speech',
      language: 'fr-FR',
      speechTimeout: 'auto',
      action: `/voice/conversation?clientInfo=${encodeURIComponent(JSON.stringify(clientInfo))}&step=1&callSid=${callSid}`,
      method: 'POST'
    });

    twiml.say({
      language: 'fr-FR',
      voice: 'Polly.Lea'
    }, 'Allo ? Vous m\'entendez ?');

    twiml.redirect(`/voice/outbound?clientInfo=${encodeURIComponent(JSON.stringify(clientInfo))}`);

  } catch (error) {
    console.error('Erreur outbound:', error);
    twiml.say({
      language: 'fr-FR',
      voice: 'Polly.Lea'
    }, 'Excusez-moi, probleme technique. Au revoir.');
    twiml.hangup();
  }

  res.type('text/xml').send(twiml.toString());
});

app.post('/voice/conversation', async (req, res) => {
  const twiml = new VoiceResponse();

  try {
    const speechResult = req.body.SpeechResult || '';
    const clientInfo = JSON.parse(decodeURIComponent(req.query.clientInfo || '{}'));
    const step = parseInt(req.query.step || '1');
    const callSid = req.query.callSid || req.body.CallSid;

    const { prenom, nom, motif, details, disponibilites, userId } = clientInfo;

    console.log(`[Step ${step}] Interlocuteur dit: "${speechResult}"`);

    // Enregistrer la reponse de l'interlocuteur
    if (callSid && speechResult) {
      await db.appendCallTranscription(callSid, `[Receptionniste] ${speechResult}`);
    }

    const systemPrompt = `Tu appelles POUR une autre personne afin de lui prendre un RDV. Tu n'es PAS cette personne.

PATIENT/CLIENT:
- Nom: ${prenom} ${nom}
- Telephone: ${clientInfo.telephone || 'non communique'}
- Motif: ${motif}
- Disponibilites: ${disponibilites}
${details ? `- Infos supplementaires: ${details}` : ''}

REGLES ABSOLUES:
1. Tu as DEJA dit bonjour. Ne te re-presente JAMAIS.
2. Parle TOUJOURS a la 3eme personne: "il/elle", "Monsieur/Madame ${nom}", JAMAIS "je" ou "moi"
3. Reponds a TOUTES les questions qu'on te pose
4. Reponds en 1-2 phrases, naturellement

REPONSES AUX QUESTIONS COURANTES:
- "Oui/D'accord" -> "Quel creneau auriez-vous de disponible ?"
- "C'est pour quand ?" -> "Il est disponible ${disponibilites}"
- "C'est deja un patient chez nous ?" -> "Non c'est pour une premiere visite" ou "Je ne sais pas, je peux lui demander"
- "Son numero de telephone ?" -> "${clientInfo.telephone || 'Je vais lui demander et vous rappeler'}"
- "Son nom ?" -> "${prenom} ${nom}"
- "C'est pour quoi ?" -> "${motif}${details ? ', ' + details : ''}"
- "J'ai [creneau]" -> "Parfait, [creneau] lui convient tres bien"
- "C'est note/confirme" -> "Merci beaucoup, bonne journee"

BALISES DE FIN:
- RDV confirme avec date+heure -> [RDV_OK:date et heure exacte]
- Impossible/complet -> [ECHEC:raison]
- Rappeler plus tard -> [RAPPEL:quand]`;

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 100,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `L'interlocuteur te dit: "${speechResult}"`
      }]
    });

    let aiResponse = response.content[0].text;
    console.log('IA repond:', aiResponse);

    // Enregistrer la reponse de l'IA
    const cleanResponse = aiResponse.replace(/\[(RDV_OK|ECHEC|RAPPEL):.*?\]/g, '').trim();
    if (callSid && cleanResponse) {
      await db.appendCallTranscription(callSid, `[IA] ${cleanResponse}`);
    }

    // Verifier RDV confirme
    const rdvMatch = aiResponse.match(/\[RDV_OK:(.*?)\]/);
    if (rdvMatch) {
      const rdvDetails = rdvMatch[1];
      aiResponse = aiResponse.replace(/\[RDV_OK:.*?\]/, '').trim();

      console.log(`RDV CONFIRME: ${prenom} ${nom} - ${rdvDetails}`);

      if (userId) {
        const call = await db.getCallByClientName(prenom, nom, 'en_cours');
        if (call) {
          await db.updateCallStatus(call.call_sid, 'succes', rdvDetails);
          await db.appendCallTranscription(call.call_sid, `\n[Fin de l'appel - RDV CONFIRME: ${rdvDetails}]`);

          await db.createAppointment({
            userId,
            callId: call.id,
            clientPrenom: prenom,
            clientNom: nom,
            entreprise: clientInfo.entreprise,
            rdvDetails
          });

          // Notification temps reel
          const notification = await db.createNotification({
            userId: parseInt(userId),
            type: 'rdv_confirmed',
            title: 'RDV confirme !',
            message: `Rendez-vous confirme pour ${prenom} ${nom} - ${rdvDetails}`,
            data: { callSid: call.call_sid, entreprise: clientInfo.entreprise, rdvDetails }
          });
          sendNotification(parseInt(userId), notification);
          sendCallUpdate(parseInt(userId), { callSid: call.call_sid, status: 'succes', rdvDetails });
        }
      }

      twiml.say({
        language: 'fr-FR',
        voice: 'Polly.Lea'
      }, aiResponse);

      twiml.hangup();
      return res.type('text/xml').send(twiml.toString());
    }

    // Verifier echec
    const echecMatch = aiResponse.match(/\[ECHEC:(.*?)\]/);
    if (echecMatch) {
      aiResponse = aiResponse.replace(/\[ECHEC:.*?\]/, '').trim();
      console.log(`ECHEC: ${echecMatch[1]}`);

      if (userId) {
        const call = await db.getCallByClientName(prenom, nom, 'en_cours');
        if (call) {
          await db.updateCallStatus(call.call_sid, 'echec', null, echecMatch[1]);
          await db.appendCallTranscription(call.call_sid, `\n[Fin de l'appel - ECHEC: ${echecMatch[1]}]`);

          // Notification echec
          const notification = await db.createNotification({
            userId: parseInt(userId),
            type: 'call_failed',
            title: 'Appel echoue',
            message: `L'appel pour ${prenom} ${nom} a echoue: ${echecMatch[1]}`,
            data: { callSid: call.call_sid, raison: echecMatch[1] }
          });
          sendNotification(parseInt(userId), notification);
          sendCallUpdate(parseInt(userId), { callSid: call.call_sid, status: 'echec', raison: echecMatch[1] });
        }
      }

      twiml.say({
        language: 'fr-FR',
        voice: 'Polly.Lea'
      }, aiResponse);

      twiml.hangup();
      return res.type('text/xml').send(twiml.toString());
    }

    // Verifier rappel
    const rappelMatch = aiResponse.match(/\[RAPPEL:(.*?)\]/);
    if (rappelMatch) {
      aiResponse = aiResponse.replace(/\[RAPPEL:.*?\]/, '').trim();
      console.log(`A RAPPELER: ${rappelMatch[1]}`);

      if (userId) {
        const call = await db.getCallByClientName(prenom, nom, 'en_cours');
        if (call) {
          await db.updateCallStatus(call.call_sid, 'rappeler', null, null, rappelMatch[1]);
          await db.appendCallTranscription(call.call_sid, `\n[Fin de l'appel - A RAPPELER: ${rappelMatch[1]}]`);

          // Programmer un rappel automatique dans 1 heure
          const scheduledAt = new Date(Date.now() + 60 * 60 * 1000);
          await db.createScheduledRecall({
            userId: parseInt(userId),
            callId: call.id,
            scheduledAt,
            clientPrenom: prenom,
            clientNom: nom,
            entreprise: clientInfo.entreprise,
            numeroEntreprise: clientInfo.numeroEntreprise,
            motif,
            details,
            disponibilites
          });

          // Notification
          const notification = await db.createNotification({
            userId: parseInt(userId),
            type: 'recall_needed',
            title: 'Rappel necessaire',
            message: `Il faut rappeler pour ${prenom} ${nom}: ${rappelMatch[1]}. Rappel automatique programme.`,
            data: { callSid: call.call_sid, quand: rappelMatch[1] }
          });
          sendNotification(parseInt(userId), notification);
          sendCallUpdate(parseInt(userId), { callSid: call.call_sid, status: 'rappeler', quand: rappelMatch[1] });
        }
      }

      twiml.say({
        language: 'fr-FR',
        voice: 'Polly.Lea'
      }, aiResponse);

      twiml.hangup();
      return res.type('text/xml').send(twiml.toString());
    }

    // Reponse normale
    twiml.say({
      language: 'fr-FR',
      voice: 'Polly.Lea'
    }, aiResponse);

    if (step < 10) {
      twiml.gather({
        input: 'speech',
        language: 'fr-FR',
        speechTimeout: 'auto',
        action: `/voice/conversation?clientInfo=${encodeURIComponent(JSON.stringify(clientInfo))}&step=${step + 1}&callSid=${callSid}`,
        method: 'POST'
      });

      twiml.say({
        language: 'fr-FR',
        voice: 'Polly.Lea'
      }, 'Allo ?');
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

app.post('/voice/status', (req, res) => {
  const { CallStatus, CallSid, CallDuration } = req.body;
  console.log(`Appel ${CallSid}: ${CallStatus} (${CallDuration || 0}s)`);
  res.sendStatus(200);
});

// Webhook pour recevoir l'URL de l'enregistrement
app.post('/voice/recording-status', async (req, res) => {
  try {
    const { CallSid, RecordingSid, RecordingUrl, RecordingStatus, RecordingDuration } = req.body;

    console.log(`Enregistrement pour ${CallSid}: ${RecordingStatus}`);
    console.log(`URL: ${RecordingUrl}`);
    console.log(`Duree: ${RecordingDuration}s`);

    if (RecordingStatus === 'completed' && RecordingUrl) {
      // Sauvegarder l'URL de l'enregistrement dans la base
      await db.updateCallRecording(CallSid, RecordingUrl, RecordingSid);

      // Mettre a jour la duree si pas deja fait
      if (RecordingDuration) {
        const call = await db.getCallByCallSid(CallSid);
        if (call && (!call.duree || call.duree === 0)) {
          await db.updateCallTranscription(CallSid, call.transcription || '', parseInt(RecordingDuration));
        }
      }

      console.log(`Enregistrement sauvegarde pour ${CallSid}`);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Erreur webhook enregistrement:', error);
    res.sendStatus(500);
  }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// RAPPELS AUTOMATIQUES (CRON)
// ============================================
async function processScheduledRecalls() {
  try {
    const pendingRecalls = await db.getPendingRecalls();

    for (const recall of pendingRecalls) {
      console.log(`Execution rappel automatique pour ${recall.client_prenom} ${recall.client_nom}`);

      // Marquer comme en cours
      await db.updateRecallStatus(recall.id, 'processing');

      // Notification
      const notification = await db.createNotification({
        userId: recall.user_id,
        type: 'recall_executing',
        title: 'Rappel automatique en cours',
        message: `Rappel automatique pour ${recall.client_prenom} ${recall.client_nom} vers ${recall.entreprise}`,
        data: { recallId: recall.id }
      });
      sendNotification(recall.user_id, notification);

      // Ici, on pourrait relancer un appel automatiquement
      // Pour l'instant, on notifie juste l'utilisateur

      await db.updateRecallStatus(recall.id, 'completed');
    }
  } catch (error) {
    console.error('Erreur traitement rappels:', error);
  }
}

// Verifier les rappels toutes les minutes
setInterval(processScheduledRecalls, 60 * 1000);

// ============================================
// DEMARRAGE
// ============================================
const PORT = process.env.PORT || 3000;

async function startServer() {
  const dbReady = await db.initDatabase();
  if (!dbReady) {
    console.error('Impossible d\'initialiser la base de donnees');
    process.exit(1);
  }

  server.listen(PORT, () => {
    console.log(`
======================================================
  RENDEVO - Assistant IA de RDV
======================================================

  URL: http://localhost:${PORT}
  WebSocket: ws://localhost:${PORT}

  Pages:
    /          - Page d'accueil
    /login     - Connexion
    /register  - Inscription
    /dashboard - Tableau de bord

  API:
    POST /api/auth/register    - Inscription
    POST /api/auth/login       - Connexion
    GET  /api/auth/me          - Profil utilisateur
    POST /api/make-call        - Lancer un appel
    GET  /api/calls            - Historique appels (filtres: status, search)
    GET  /api/calls/:callSid   - Detail d'un appel + transcription
    GET  /api/appointments     - Liste des RDV
    GET  /api/notifications    - Liste des notifications
    POST /api/schedule-recall  - Programmer un rappel
    GET  /api/stats            - Statistiques
    GET  /api/stats/weekly     - Stats hebdomadaires (graphiques)
    GET  /api/stats/success-rate - Taux de succes

  Base de donnees: Neon PostgreSQL (connectee)
  Notifications: Socket.IO (actif)
======================================================
    `);
  });
}

startServer();
