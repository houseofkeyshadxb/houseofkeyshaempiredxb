// netlify/functions/booking.js
// Receives booking interest clicks from the website
// Sends Telegram notification to Mistress Keysha
// Set env vars: TELEGRAM_NOTIFICATION_BOT_TOKEN, TELEGRAM_NOTIFICATION_CHAT_ID

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { service, source, persona } = body;
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC';

  // Send Telegram notification if configured
  if (process.env.TELEGRAM_NOTIFICATION_BOT_TOKEN && process.env.TELEGRAM_NOTIFICATION_CHAT_ID) {
    const msg = [
      '🔱 *NEW BOOKING INTEREST*',
      '',
      `📋 *Service:* ${service || 'Not specified'}`,
      `👤 *Persona:* ${persona || 'Unknown'}`,
      `🌐 *Source:* ${source || 'website'}`,
      `🕐 *Time:* ${timestamp}`,
      '',
      'Check cal.com/houseofkeyshaempiredxb for new bookings.'
    ].join('\n');

    try {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_NOTIFICATION_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_NOTIFICATION_CHAT_ID,
          text: msg,
          parse_mode: 'Markdown'
        })
      });
    } catch (e) {
      console.error('Telegram notification failed:', e.message);
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true })
  };
};
