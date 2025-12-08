require('dotenv').config();
const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const { handleIncomingCall, handleGather, handleTransfer } = require('./services/twilio');
const { processAudioStream } = require('./services/speech');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ============================================
// ROUTES TWILIO
// ============================================

// Route principale : appel entrant
app.post('/voice/incoming', (req, res) => {
  console.log('📞 Appel entrant de:', req.body.From);
  const twiml = handleIncomingCall(req.body);
  res.type('text/xml').send(twiml);
});

// Route : traitement de ce que dit l'appelant
app.post('/voice/gather', async (req, res) => {
  console.log('🎤 Parole reçue');
  const twiml = await handleGather(req.body);
  res.type('text/xml').send(twiml);
});

// Route : transfert d'appel urgent
app.post('/voice/transfer', (req, res) => {
  console.log('🔀 Transfert d\'appel');
  const twiml = handleTransfer();
  res.type('text/xml').send(twiml);
});

// Route : envoyer SMS
app.post('/sms/send', async (req, res) => {
  const { to, message } = req.body;
  try {
    const { sendSMS } = require('./services/twilio');
    await sendSMS(to, message);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route : statut de l'appel (callback)
app.post('/voice/status', (req, res) => {
  console.log('📊 Statut appel:', req.body.CallStatus);
  res.sendStatus(200);
});

// ============================================
// WEBSOCKET POUR STREAMING AUDIO (optionnel, pour temps réel)
// ============================================

const wss = new WebSocketServer({ server, path: '/media-stream' });

wss.on('connection', (ws) => {
  console.log('🔌 WebSocket connecté pour streaming audio');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.event === 'media') {
        // Traiter l'audio en streaming
        await processAudioStream(data.media.payload, ws);
      }
    } catch (error) {
      console.error('Erreur WebSocket:', error);
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket déconnecté');
  });
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Assistant Téléphonique IA',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// ============================================
// DÉMARRAGE SERVEUR
// ============================================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`
  🚀 Serveur démarré sur le port ${PORT}

  📞 Endpoints Twilio:
     POST /voice/incoming  - Appels entrants
     POST /voice/gather    - Traitement parole
     POST /voice/transfer  - Transfert appel
     POST /sms/send        - Envoi SMS

  🔌 WebSocket:
     ws://localhost:${PORT}/media-stream

  ⚙️  Configuration:
     - Entreprise: ${process.env.BUSINESS_NAME || 'Non configuré'}
     - Numéro Twilio: ${process.env.TWILIO_PHONE_NUMBER || 'Non configuré'}
  `);
});

module.exports = { app, server };
