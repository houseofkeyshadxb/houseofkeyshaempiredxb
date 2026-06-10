// netlify/functions/chat.js
// Groq primary, Gemini fallback
// Set env vars in Netlify dashboard: GROQ_API_KEY, GEMINI_API_KEY

const SYSTEM_PROMPT = `You are the Empire Assistant for House of Keysha Empire, a luxury BDSM and domination services business in Dubai. You are professional, discreet, and authoritative in tone.

You help visitors:
- Understand the services offered by Mistress Keysha, Becky, Mae, Pepper, and Master Ron
- Learn about booking and consultation options via cal.com/houseofkeyshaempiredxb
- Understand the sissy training programme (6 phases)
- Get pricing information
- Contact via WhatsApp +971567620449 or +971567299030 or Telegram @keysha_zara

You do NOT:
- Discuss illegal activities
- Engage in explicit sexual content in chat
- Share personal data about staff
- Make booking commitments (direct to cal.com)

Keep responses concise, elegant, and in keeping with the Empire's premium positioning.`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  let message;
  try {
    ({ message } = JSON.parse(event.body));
    if (!message) throw new Error('No message');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  // Try Groq first
  if (process.env.GROQ_API_KEY) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: message }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });
      if (res.ok) {
        const data = await res.json();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ reply: data.choices[0].message.content })
        };
      }
    } catch (e) {
      console.error('Groq error:', e.message);
    }
  }

  // Gemini fallback
  if (process.env.GEMINI_API_KEY) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: SYSTEM_PROMPT + '\n\nUser: ' + message }] }],
            generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
          })
        }
      );
      if (res.ok) {
        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
        }
      }
    } catch (e) {
      console.error('Gemini error:', e.message);
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      reply: 'The Empire Assistant is temporarily offline. Please WhatsApp us at +971567620449 or Telegram @keysha_zara for immediate assistance.'
    })
  };
};
