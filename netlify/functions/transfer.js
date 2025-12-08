const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

exports.handler = async (event, context) => {
  const twiml = new VoiceResponse();

  twiml.say({
    language: 'fr-FR',
    voice: 'Polly.Lea'
  }, 'Je vous transfère vers un conseiller. Veuillez patienter.');

  twiml.dial({
    callerId: process.env.TWILIO_PHONE_NUMBER
  }, process.env.TRANSFER_PHONE || '+33123456789');

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/xml'
    },
    body: twiml.toString()
  };
};
