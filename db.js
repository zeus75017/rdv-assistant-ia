const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// Initialiser les tables
async function initDatabase() {
  try {
    // Table des utilisateurs
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        prenom VARCHAR(100) NOT NULL,
        nom VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        telephone VARCHAR(20),
        entreprise VARCHAR(200),
        password VARCHAR(255) NOT NULL,
        plan VARCHAR(50) DEFAULT 'starter',
        credits_appels INTEGER DEFAULT 20,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Table des appels
    await sql`
      CREATE TABLE IF NOT EXISTS calls (
        id SERIAL PRIMARY KEY,
        call_sid VARCHAR(100) UNIQUE,
        user_id INTEGER REFERENCES users(id),
        client_prenom VARCHAR(100),
        client_nom VARCHAR(100),
        entreprise VARCHAR(200),
        numero_entreprise VARCHAR(50),
        motif VARCHAR(100),
        details TEXT,
        status VARCHAR(50) DEFAULT 'en_cours',
        rdv_details VARCHAR(255),
        raison TEXT,
        quand VARCHAR(100),
        transcription TEXT,
        duree INTEGER DEFAULT 0,
        rappel_programme TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Ajouter les colonnes si elles n'existent pas (pour les DB existantes)
    try {
      await sql`ALTER TABLE calls ADD COLUMN IF NOT EXISTS transcription TEXT`;
      await sql`ALTER TABLE calls ADD COLUMN IF NOT EXISTS duree INTEGER DEFAULT 0`;
      await sql`ALTER TABLE calls ADD COLUMN IF NOT EXISTS rappel_programme TIMESTAMP`;
      await sql`ALTER TABLE calls ADD COLUMN IF NOT EXISTS recording_url TEXT`;
      await sql`ALTER TABLE calls ADD COLUMN IF NOT EXISTS recording_sid VARCHAR(100)`;
    } catch (e) {
      // Colonnes existent deja
    }

    // Table des rendez-vous
    await sql`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        call_id INTEGER REFERENCES calls(id),
        client_prenom VARCHAR(100),
        client_nom VARCHAR(100),
        entreprise VARCHAR(200),
        rdv_details VARCHAR(255),
        rdv_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'confirme',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Ajouter colonne rdv_date si elle n'existe pas
    try {
      await sql`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS rdv_date TIMESTAMP`;
    } catch (e) {
      // Colonne existe deja
    }

    // Table des notifications
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT,
        read BOOLEAN DEFAULT FALSE,
        data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Table des rappels programmés
    await sql`
      CREATE TABLE IF NOT EXISTS scheduled_recalls (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        call_id INTEGER REFERENCES calls(id),
        scheduled_at TIMESTAMP NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        client_prenom VARCHAR(100),
        client_nom VARCHAR(100),
        entreprise VARCHAR(200),
        numero_entreprise VARCHAR(50),
        motif VARCHAR(100),
        details TEXT,
        disponibilites TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Base de donnees initialisee');
    return true;
  } catch (error) {
    console.error('Erreur initialisation DB:', error);
    return false;
  }
}

// Fonctions utilisateurs
async function createUser(userData) {
  const { prenom, nom, email, telephone, entreprise, password, plan } = userData;
  const creditsAppels = plan === 'business' ? 500 : plan === 'pro' ? 100 : 20;

  const result = await sql`
    INSERT INTO users (prenom, nom, email, telephone, entreprise, password, plan, credits_appels)
    VALUES (${prenom}, ${nom}, ${email}, ${telephone || null}, ${entreprise || null}, ${password}, ${plan || 'starter'}, ${creditsAppels})
    RETURNING id, prenom, nom, email, telephone, entreprise, plan, credits_appels, created_at
  `;
  return result[0];
}

async function getUserByEmail(email) {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email}
  `;
  return result[0];
}

async function getUserById(id) {
  const result = await sql`
    SELECT id, prenom, nom, email, telephone, entreprise, plan, credits_appels, created_at
    FROM users WHERE id = ${id}
  `;
  return result[0];
}

async function updateUserCredits(userId, credits) {
  await sql`
    UPDATE users SET credits_appels = ${credits} WHERE id = ${userId}
  `;
}

// Fonctions appels
async function createCall(callData) {
  const { callSid, userId, clientPrenom, clientNom, entreprise, numeroEntreprise, motif, details } = callData;

  const result = await sql`
    INSERT INTO calls (call_sid, user_id, client_prenom, client_nom, entreprise, numero_entreprise, motif, details, status)
    VALUES (${callSid}, ${userId}, ${clientPrenom}, ${clientNom}, ${entreprise || null}, ${numeroEntreprise}, ${motif || null}, ${details || null}, 'en_cours')
    RETURNING *
  `;
  return result[0];
}

async function getCallByCallSid(callSid) {
  const result = await sql`
    SELECT * FROM calls WHERE call_sid = ${callSid}
  `;
  return result[0];
}

async function getCallsByUserId(userId, filters = {}) {
  const { status, entreprise, dateFrom, dateTo, search } = filters;

  let result;

  if (search) {
    result = await sql`
      SELECT * FROM calls
      WHERE user_id = ${userId}
        AND (
          LOWER(client_prenom) LIKE LOWER(${'%' + search + '%'})
          OR LOWER(client_nom) LIKE LOWER(${'%' + search + '%'})
          OR LOWER(entreprise) LIKE LOWER(${'%' + search + '%'})
        )
      ORDER BY created_at DESC
    `;
  } else if (status && status !== 'all') {
    result = await sql`
      SELECT * FROM calls
      WHERE user_id = ${userId} AND status = ${status}
      ORDER BY created_at DESC
    `;
  } else {
    result = await sql`
      SELECT * FROM calls WHERE user_id = ${userId} ORDER BY created_at DESC
    `;
  }

  return result;
}

async function updateCallStatus(callSid, status, rdvDetails = null, raison = null, quand = null) {
  await sql`
    UPDATE calls
    SET status = ${status},
        rdv_details = COALESCE(${rdvDetails}, rdv_details),
        raison = COALESCE(${raison}, raison),
        quand = COALESCE(${quand}, quand)
    WHERE call_sid = ${callSid}
  `;
}

async function updateCallTranscription(callSid, transcription, duree = 0) {
  await sql`
    UPDATE calls
    SET transcription = ${transcription}, duree = ${duree}
    WHERE call_sid = ${callSid}
  `;
}

async function appendCallTranscription(callSid, newMessage) {
  const call = await getCallByCallSid(callSid);
  const currentTranscription = call?.transcription || '';
  const updatedTranscription = currentTranscription + newMessage + '\n';

  await sql`
    UPDATE calls SET transcription = ${updatedTranscription} WHERE call_sid = ${callSid}
  `;

  return updatedTranscription;
}

async function getCallByClientName(prenom, nom, status) {
  const result = await sql`
    SELECT * FROM calls
    WHERE client_prenom = ${prenom}
      AND client_nom = ${nom}
      AND status = ${status}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  return result[0];
}

async function updateCallRecording(callSid, recordingUrl, recordingSid = null) {
  await sql`
    UPDATE calls
    SET recording_url = ${recordingUrl}, recording_sid = ${recordingSid}
    WHERE call_sid = ${callSid}
  `;
}

// Fonctions rendez-vous
async function createAppointment(appointmentData) {
  const { userId, callId, clientPrenom, clientNom, entreprise, rdvDetails, rdvDate } = appointmentData;

  const result = await sql`
    INSERT INTO appointments (user_id, call_id, client_prenom, client_nom, entreprise, rdv_details, rdv_date, status)
    VALUES (${userId}, ${callId || null}, ${clientPrenom}, ${clientNom}, ${entreprise || null}, ${rdvDetails}, ${rdvDate || null}, 'confirme')
    RETURNING *
  `;
  return result[0];
}

async function getAppointmentsByUserId(userId) {
  const result = await sql`
    SELECT * FROM appointments WHERE user_id = ${userId} ORDER BY COALESCE(rdv_date, created_at) DESC
  `;
  return result;
}

// Fonctions notifications
async function createNotification(notificationData) {
  const { userId, type, title, message, data } = notificationData;

  const result = await sql`
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (${userId}, ${type}, ${title}, ${message || null}, ${JSON.stringify(data) || null})
    RETURNING *
  `;
  return result[0];
}

async function getNotificationsByUserId(userId, unreadOnly = false) {
  if (unreadOnly) {
    return await sql`
      SELECT * FROM notifications
      WHERE user_id = ${userId} AND read = FALSE
      ORDER BY created_at DESC
    `;
  }
  return await sql`
    SELECT * FROM notifications
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 50
  `;
}

async function markNotificationRead(notificationId, userId) {
  await sql`
    UPDATE notifications SET read = TRUE
    WHERE id = ${notificationId} AND user_id = ${userId}
  `;
}

async function markAllNotificationsRead(userId) {
  await sql`
    UPDATE notifications SET read = TRUE WHERE user_id = ${userId}
  `;
}

// Fonctions rappels programmés
async function createScheduledRecall(recallData) {
  const { userId, callId, scheduledAt, clientPrenom, clientNom, entreprise, numeroEntreprise, motif, details, disponibilites } = recallData;

  const result = await sql`
    INSERT INTO scheduled_recalls (user_id, call_id, scheduled_at, client_prenom, client_nom, entreprise, numero_entreprise, motif, details, disponibilites)
    VALUES (${userId}, ${callId || null}, ${scheduledAt}, ${clientPrenom}, ${clientNom}, ${entreprise || null}, ${numeroEntreprise}, ${motif || null}, ${details || null}, ${disponibilites || null})
    RETURNING *
  `;
  return result[0];
}

async function getScheduledRecallsByUserId(userId) {
  return await sql`
    SELECT * FROM scheduled_recalls
    WHERE user_id = ${userId} AND status = 'pending'
    ORDER BY scheduled_at ASC
  `;
}

async function getPendingRecalls() {
  return await sql`
    SELECT * FROM scheduled_recalls
    WHERE status = 'pending' AND scheduled_at <= NOW()
    ORDER BY scheduled_at ASC
  `;
}

async function updateRecallStatus(recallId, status) {
  await sql`
    UPDATE scheduled_recalls SET status = ${status} WHERE id = ${recallId}
  `;
}

// Fonctions stats avancées
async function getUserStats(userId) {
  const calls = await sql`
    SELECT
      COUNT(*) as total_appels,
      COUNT(*) FILTER (WHERE status = 'en_cours') as en_cours,
      COUNT(*) FILTER (WHERE status = 'succes') as succes,
      COUNT(*) FILTER (WHERE status = 'echec') as echecs,
      COUNT(*) FILTER (WHERE status = 'rappeler') as a_rappeler
    FROM calls WHERE user_id = ${userId}
  `;

  const appointments = await sql`
    SELECT COUNT(*) as total FROM appointments WHERE user_id = ${userId}
  `;

  return {
    totalAppels: parseInt(calls[0].total_appels) || 0,
    rdvConfirmes: parseInt(appointments[0].total) || 0,
    appelsEnCours: parseInt(calls[0].en_cours) || 0,
    echecs: parseInt(calls[0].echecs) || 0,
    aRappeler: parseInt(calls[0].a_rappeler) || 0
  };
}

async function getWeeklyStats(userId) {
  const result = await sql`
    SELECT
      DATE(created_at) as date,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'succes') as succes,
      COUNT(*) FILTER (WHERE status = 'echec') as echecs
    FROM calls
    WHERE user_id = ${userId}
      AND created_at >= NOW() - INTERVAL '7 days'
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  // Remplir les jours manquants avec des zeros
  const days = [];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayName = dayNames[date.getDay()];

    const found = result.find(r => r.date?.toISOString().split('T')[0] === dateStr);
    days.push({
      name: dayName,
      date: dateStr,
      total: found ? parseInt(found.total) : 0,
      succes: found ? parseInt(found.succes) : 0,
      echecs: found ? parseInt(found.echecs) : 0
    });
  }

  return days;
}

async function getMonthlyStats(userId) {
  const result = await sql`
    SELECT
      DATE_TRUNC('week', created_at) as week,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'succes') as succes
    FROM calls
    WHERE user_id = ${userId}
      AND created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE_TRUNC('week', created_at)
    ORDER BY week ASC
  `;

  return result.map(r => ({
    week: r.week,
    total: parseInt(r.total) || 0,
    succes: parseInt(r.succes) || 0
  }));
}

async function getSuccessRate(userId) {
  const result = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'succes') as succes,
      COUNT(*) FILTER (WHERE status IN ('succes', 'echec')) as total
    FROM calls
    WHERE user_id = ${userId}
  `;

  const succes = parseInt(result[0].succes) || 0;
  const total = parseInt(result[0].total) || 1;

  return Math.round((succes / total) * 100);
}

module.exports = {
  sql,
  initDatabase,
  createUser,
  getUserByEmail,
  getUserById,
  updateUserCredits,
  createCall,
  getCallByCallSid,
  getCallsByUserId,
  updateCallStatus,
  updateCallTranscription,
  appendCallTranscription,
  getCallByClientName,
  updateCallRecording,
  createAppointment,
  getAppointmentsByUserId,
  createNotification,
  getNotificationsByUserId,
  markNotificationRead,
  markAllNotificationsRead,
  createScheduledRecall,
  getScheduledRecallsByUserId,
  getPendingRecalls,
  updateRecallStatus,
  getUserStats,
  getWeeklyStats,
  getMonthlyStats,
  getSuccessRate
};
