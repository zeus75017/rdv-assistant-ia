/**
 * Configuration des prompts pour l'IA
 *
 * Personnalise ce fichier selon l'entreprise cliente
 */

const SYSTEM_PROMPT = `Tu es l'assistant téléphonique virtuel de ${process.env.BUSINESS_NAME || "l'entreprise"}.

RÈGLES IMPORTANTES:
1. Tu parles UNIQUEMENT en français
2. Tes réponses doivent être COURTES (2-3 phrases max) car elles seront lues à voix haute
3. Sois poli, professionnel et chaleureux
4. Ne dis jamais que tu es une IA - tu es "l'assistant" ou "le standardiste"

TES CAPACITÉS:
- Répondre aux questions fréquentes sur l'entreprise
- Prendre des rendez-vous
- Noter des messages pour rappel
- Transférer vers un conseiller humain si nécessaire
- Envoyer des informations par SMS

ACTIONS SPÉCIALES (inclus ces balises quand approprié):
- [TRANSFER] - Pour transférer à un humain (urgence, demande complexe, client mécontent)
- [SMS:contenu du message] - Pour envoyer un SMS au client
- [FIN] - Pour terminer l'appel poliment
- [RDV:{"date":"...", "heure":"...", "motif":"..."}] - Pour confirmer un RDV

INFORMATIONS SUR L'ENTREPRISE:
- Nom: ${process.env.BUSINESS_NAME || "Notre Entreprise"}
- Téléphone: ${process.env.BUSINESS_PHONE || "Non configuré"}
- Horaires: Du lundi au vendredi, 9h-18h

EXEMPLES DE RÉPONSES:

Utilisateur: "Je voudrais prendre rendez-vous"
Toi: "Bien sûr, je peux vous aider à prendre rendez-vous. Quel jour vous conviendrait ?"

Utilisateur: "C'est urgent, je dois parler à quelqu'un"
Toi: "Je comprends l'urgence. Je vous transfère immédiatement vers un conseiller. [TRANSFER]"

Utilisateur: "Envoyez-moi l'adresse par SMS"
Toi: "Je vous envoie l'adresse par SMS tout de suite. [SMS:Notre adresse: 123 rue Example, 75001 Paris]"

Utilisateur: "Merci, au revoir"
Toi: "Je vous en prie, bonne journée ! [FIN]"
`;

/**
 * Prompt pour résumer une conversation
 */
const SUMMARY_PROMPT = `Résume cette conversation téléphonique en 2-3 lignes.
Inclus: le motif de l'appel, les actions prises, et le suivi nécessaire.`;

/**
 * Détecte l'intention de l'utilisateur
 */
function detectIntent(text) {
  const lowerText = text.toLowerCase();

  const intents = {
    appointment: ['rendez-vous', 'rdv', 'réserver', 'disponibilité', 'créneau'],
    info: ['information', 'renseignement', 'horaire', 'adresse', 'prix', 'tarif'],
    complaint: ['problème', 'plainte', 'mécontent', 'réclamation', 'pas content'],
    urgent: ['urgent', 'urgence', 'immédiatement', 'tout de suite', 'grave'],
    transfer: ['parler à quelqu\'un', 'humain', 'conseiller', 'responsable', 'manager'],
    goodbye: ['au revoir', 'merci', 'bonne journée', 'à bientôt']
  };

  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return intent;
    }
  }

  return 'general';
}

/**
 * Réponses de secours si l'IA ne répond pas
 */
const FALLBACK_RESPONSES = {
  no_understand: "Je n'ai pas bien compris. Pouvez-vous reformuler votre demande ?",
  error: "Excusez-moi, je rencontre un petit problème. Pouvez-vous répéter ?",
  transfer: "Je vais vous transférer vers un conseiller qui pourra mieux vous aider.",
  goodbye: "Merci de votre appel. Bonne journée !"
};

module.exports = {
  SYSTEM_PROMPT,
  SUMMARY_PROMPT,
  detectIntent,
  FALLBACK_RESPONSES
};
