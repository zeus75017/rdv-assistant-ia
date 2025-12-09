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

// Fonction pour parser une date de RDV en texte vers une vraie date
function parseRdvDate(rdvText) {
  const text = rdvText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const today = new Date();
  let targetDate = new Date(today);
  let hour = 9; // Heure par defaut
  let minute = 0;

  // Parser l'heure (ex: 10h30, 14h, 9h00)
  const heureMatch = text.match(/(\d{1,2})\s*h\s*(\d{2})?/);
  if (heureMatch) {
    hour = parseInt(heureMatch[1]);
    minute = heureMatch[2] ? parseInt(heureMatch[2]) : 0;
  }

  // Jours de la semaine
  const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const joursSimple = jours.map(j => j.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));

  // Chercher un jour de la semaine
  let foundDay = -1;
  for (let i = 0; i < joursSimple.length; i++) {
    if (text.includes(joursSimple[i])) {
      foundDay = i;
      break;
    }
  }

  // Mois
  const mois = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'];

  // Chercher une date explicite (ex: "15 janvier", "le 20")
  const dateExpliciteMatch = text.match(/(\d{1,2})\s*(janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre)?/);

  if (dateExpliciteMatch && dateExpliciteMatch[2]) {
    // Date avec mois (ex: "15 janvier")
    const jour = parseInt(dateExpliciteMatch[1]);
    const moisIndex = mois.indexOf(dateExpliciteMatch[2]);
    targetDate.setMonth(moisIndex);
    targetDate.setDate(jour);
    // Si la date est passee, on prend l'annee prochaine
    if (targetDate < today) {
      targetDate.setFullYear(targetDate.getFullYear() + 1);
    }
  } else if (foundDay !== -1) {
    // Jour de la semaine (ex: "lundi")
    const currentDay = today.getDay();
    let daysToAdd = foundDay - currentDay;
    if (daysToAdd <= 0) {
      daysToAdd += 7; // Prochain lundi, pas lundi passe
    }
    targetDate.setDate(today.getDate() + daysToAdd);
  } else if (text.includes('demain')) {
    targetDate.setDate(today.getDate() + 1);
  } else if (text.includes('apres-demain') || text.includes('apres demain')) {
    targetDate.setDate(today.getDate() + 2);
  } else if (text.includes('aujourd')) {
    // Aujourd'hui
  } else if (dateExpliciteMatch && !dateExpliciteMatch[2]) {
    // Juste un numero de jour sans mois (ex: "le 15")
    const jour = parseInt(dateExpliciteMatch[1]);
    targetDate.setDate(jour);
    // Si la date est passee ce mois-ci, on prend le mois prochain
    if (targetDate < today) {
      targetDate.setMonth(targetDate.getMonth() + 1);
    }
  }

  targetDate.setHours(hour, minute, 0, 0);
  return targetDate;
}

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
// SERVIR LE CLIENT REACT
// ============================================
app.use(express.static(path.join(__dirname, 'client', 'dist')));

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

    // Formater le numero de telephone (enlever les doublons de +33)
    let numeroFormate = numero_entreprise.replace(/\s/g, ''); // Enlever espaces
    // Si le numero commence par +33 suivi de 0, enlever le 0
    if (numeroFormate.startsWith('+330')) {
      numeroFormate = '+33' + numeroFormate.slice(4);
    }
    // Si le numero commence par 0, le convertir en +33
    if (numeroFormate.startsWith('0')) {
      numeroFormate = '+33' + numeroFormate.slice(1);
    }
    // Si le numero a un double +33 (ex: +3333...)
    if (numeroFormate.startsWith('+3333')) {
      numeroFormate = '+33' + numeroFormate.slice(5);
    }

    console.log('Lancement appel vers:', numeroFormate);

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
      to: numeroFormate,
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
      numeroEntreprise: numeroFormate,
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

    // Ne pas debiter maintenant, attendre le resultat de l'appel

    console.log('Appel lance:', callSid);

    res.json({
      success: true,
      callSid: callSid,
      message: 'Appel en cours',
      creditsRestants: user.credits_appels
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

// Proxy pour l'audio Twilio (telecharge et sert le fichier sans exposer Twilio)
// Accepte le token en query string car les balises audio ne peuvent pas envoyer de headers
app.get('/api/recording-audio/:callSid', async (req, res) => {
  try {
    // Authentification via query string ou header
    const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Non autorise' });
    }

    let user;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = await db.getUserById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouve' });
      }
    } catch (err) {
      console.error('Erreur verification token:', err.message);
      return res.status(401).json({ error: 'Token invalide' });
    }

    const call = await db.getCallByCallSid(req.params.callSid);
    if (!call || call.user_id !== user.id) {
      return res.status(404).json({ error: 'Appel non trouve' });
    }

    if (!call.recording_url) {
      return res.status(404).json({ error: 'Aucun enregistrement disponible' });
    }

    // Telecharger depuis Twilio avec authentification
    const recordingUrl = call.recording_url + '.mp3';
    const authString = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');

    const response = await fetch(recordingUrl, {
      headers: {
        'Authorization': `Basic ${authString}`
      }
    });

    if (!response.ok) {
      console.error('Erreur Twilio:', response.status, response.statusText);
      return res.status(404).json({ error: 'Enregistrement non disponible' });
    }

    // Servir le fichier audio directement
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `inline; filename="enregistrement-${req.params.callSid}.mp3"`,
      'Cache-Control': 'private, max-age=3600'
    });

    // Streamer la reponse
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
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

    // Recuperer l'historique de la conversation
    let conversationHistory = [];
    if (callSid) {
      const call = await db.getCallByCallSid(callSid);
      if (call && call.transcription) {
        // Parser la transcription pour construire l'historique
        const lines = call.transcription.split('\n').filter(line => line.trim());
        for (const line of lines) {
          if (line.includes('[IA]')) {
            const content = line.replace('[IA]', '').trim();
            if (content) conversationHistory.push({ role: 'assistant', content });
          } else if (line.includes('[Receptionniste]')) {
            const content = line.replace('[Receptionniste]', '').trim();
            if (content) conversationHistory.push({ role: 'user', content });
          }
        }
      }
    }

    // Enregistrer la reponse de l'interlocuteur
    if (callSid && speechResult) {
      await db.appendCallTranscription(callSid, `[Receptionniste] ${speechResult}`);
    }

    const systemPrompt = `Tu es un assistant telephonique qui appelle POUR une autre personne afin de lui prendre un RDV. Tu n'es PAS cette personne.

PATIENT/CLIENT QUE TU REPRESENTES:
- Nom complet: ${prenom} ${nom}
- Telephone: ${clientInfo.telephone || 'non communique'}
- Motif du RDV: ${motif}
- Disponibilites: ${disponibilites}
${details ? `- Infos supplementaires: ${details}` : ''}

REGLES CRITIQUES:
1. Ne te re-presente JAMAIS (tu l'as deja fait)
2. Parle TOUJOURS a la 3eme personne: "il/elle", "Monsieur/Madame ${nom}" - JAMAIS "je" ou "moi"
3. Reponds en 1-2 phrases maximum, de maniere naturelle
4. ECOUTE attentivement ce que dit l'interlocuteur - ne redemande JAMAIS une info deja donnee

DETECTION DU RDV CONFIRME:
Si l'interlocuteur dit quelque chose comme:
- "OK", "D'accord", "C'est note", "C'est bon", "Parfait", "Tres bien"
- "Je vous le note", "C'est enregistre"
- Confirme un creneau que tu as accepte

ALORS le RDV est CONFIRME ! Reponds "Parfait, merci beaucoup. Bonne journee !" et ajoute [RDV_OK:creneau confirme]

EXEMPLES DE CONVERSATION:
- Receptionniste: "Oui quand est-ce qu'il veut venir ?" -> Toi: "Il est disponible ${disponibilites}. Qu'est-ce qui vous arrangerait ?"
- Receptionniste: "Lundi 9h30 ca va ?" -> Toi: "Parfait, lundi 9h30 lui convient tres bien."
- Receptionniste: "Ok c'est note" -> Toi: "Merci beaucoup, bonne journee ! [RDV_OK:lundi 9h30]"
- Receptionniste: "Son numero ?" -> Toi: "${clientInfo.telephone || 'Je vais lui demander et vous rappeler'}"

BALISES DE FIN (a ajouter a ta reponse quand approprié):
- RDV confirme -> [RDV_OK:date et heure exacte]
- Impossible/complet/refuse -> [ECHEC:raison]
- Doit rappeler plus tard -> [RAPPEL:quand]`;

    // Construire les messages avec l'historique
    const messages = [...conversationHistory];
    messages.push({
      role: 'user',
      content: speechResult
    });

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 100,
      system: systemPrompt,
      messages: messages
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

      // Parser la date du RDV
      const rdvDate = parseRdvDate(rdvDetails);
      console.log(`Date du RDV parsee: ${rdvDate.toISOString()}`);

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
            rdvDetails,
            rdvDate
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

app.post('/voice/status', async (req, res) => {
  try {
    const { CallStatus, CallSid, CallDuration } = req.body;
    console.log(`Appel ${CallSid}: ${CallStatus} (${CallDuration || 0}s)`);

    const call = await db.getCallByCallSid(CallSid);

    if (call) {
      // Si l'appel a echoue (failed, busy, no-answer)
      if (['failed', 'busy', 'no-answer'].includes(CallStatus)) {
        await db.updateCallStatus(CallSid, 'echec', null, CallStatus === 'failed' ? 'Appel echoue' : CallStatus === 'busy' ? 'Ligne occupee' : 'Pas de reponse');

        // Notification d'echec
        const notification = await db.createNotification({
          userId: call.user_id,
          type: 'call_failed',
          title: 'Appel echoue',
          message: `L'appel vers ${call.entreprise} a echoue: ${CallStatus}`,
          data: { callSid: CallSid, raison: CallStatus }
        });
        sendNotification(call.user_id, notification);
        sendCallUpdate(call.user_id, { callSid: CallSid, status: 'echec', raison: CallStatus });

        console.log(`Appel ${CallSid} echoue - credits non debites`);
      }
      // Si l'appel s'est termine normalement (completed), debiter le credit
      else if (CallStatus === 'completed') {
        const user = await db.getUserById(call.user_id);
        if (user && user.credits_appels > 0) {
          await db.updateUserCredits(call.user_id, user.credits_appels - 1);
          console.log(`Credit debite pour utilisateur ${call.user_id}`);
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Erreur webhook status:', error);
    res.sendStatus(200);
  }
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
// CATCH-ALL POUR REACT ROUTER
// ============================================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

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
