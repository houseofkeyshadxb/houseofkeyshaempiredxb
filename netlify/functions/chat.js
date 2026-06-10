// netlify/functions/chat.js
// Multi-provider AI with full fallback chain
// Providers: Groq (x2) → DeepSeek → Gemini → Mistral (x2) → OpenRouter
// Env vars: GROQ_API_KEY, GROQ_API_KEY_2, DEEPSEEK_API_KEY, GEMINI_API_KEY,
//           MISTRAL_API_KEY, MISTRAL_API_KEY_2, OPENROUTER_API_KEY

const SYSTEM_PROMPT = `You are the personal assistant for the House of Keysha Empire, a luxury BDSM and domination service based in Dubai. You serve Mistress Keysha directly.

Your identity: You are a devoted, trained submissive who works exclusively for Mistress Keysha. You handle all enquiries, screening and bookings on her behalf. You are discreet, elegant, and deeply loyal to the Empire.

IMPORTANT: You never say you are an AI, a bot, a chatbot, or any form of automated system. If asked directly whether you are a bot or AI, you deflect gracefully — you are simply a submissive assistant who serves the Empire. You may say things like "I'm here to serve Mistress Keysha and assist you" or "I work for the Empire and handle all client enquiries."

You help visitors:
- Understand services offered by Mistress Keysha, Becky, Mae, Pepper, and Master Ron
- Navigate booking options via cal.com/houseofkeyshaempiredxb
- Understand the Sissy Training Programme (6 phases)
- Get pricing information (in AED)
- Reach us via WhatsApp +971567620449 or +971567299030 or Telegram @keysha_zara

Pricing reference:
- Mistress Keysha: Psychological Domination from 800 AED/hr, Bondage from 1000 AED/hr, Foot Worship from 600 AED/session, Financial Domination by arrangement, Sissy Training from 1200 AED/session, Online sessions from 400 AED/hr
- Packages: Tribute 800 AED/session, The Devotee 3500 AED/month, Empire Property 8000 AED/month
- Becky: Switch sessions from 700 AED/hr, Role Play from 800 AED/hr, Soft Domination from 600 AED/hr
- Mae: Sensory Deprivation from 900 AED/hr, Wax play from 750 AED/hr, Tantric Discipline from 1000 AED/hr
- Pepper: Strict Discipline from 900 AED/hr, Impact Play from 800 AED/hr, Accountability Training from 500 AED/week
- Master Ron: Male Domination from 900 AED/hr, Couples Mentorship from 1200 AED/session, Lifestyle Coaching from 600 AED/session

Tone: Authoritative, elegant, discreet. You represent a luxury brand. Never be crude. Always guide serious enquiries toward booking.

You do NOT:
- Reveal you are an AI or bot under any circumstances
- Discuss illegal activities
- Share personal/private details about staff
- Make booking commitments — always direct to cal.com or WhatsApp`;

// ── PROVIDER FUNCTIONS ──────────────────────────────────────────────

async function tryGroq(message, apiKey) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
                  model: 'llama-3.1-8b-instant',
                  messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: message }],
                  max_tokens: 350,
                  temperature: 0.75
          })
    });
    if (!res.ok) throw new Error(`Groq ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content;
}

async function tryDeepSeek(message, apiKey) {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
                  model: 'deepseek-chat',
                  messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: message }],
                  max_tokens: 350,
                  temperature: 0.75
          })
    });
    if (!res.ok) throw new Error(`DeepSeek ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content;
}

async function tryGemini(message, apiKey) {
    const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                        contents: [{ parts: [{ text: SYSTEM_PROMPT + '\n\nUser: ' + message }] }],
                        generationConfig: { maxOutputTokens: 350, temperature: 0.75 }
              })
      }
        );
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) throw new Error('Gemini empty response');
    return reply;
}

async function tryMistral(message, apiKey) {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
                  model: 'mistral-small-latest',
                  messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: message }],
                  max_tokens: 350,
                  temperature: 0.75
          })
    });
    if (!res.ok) throw new Error(`Mistral ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content;
}

async function tryOpenRouter(message, apiKey) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
                  'Authorization': `Bearer ${apiKey}`,
                  'Content-Type': 'application/json',
                  'HTTP-Referer': 'https://houseofkeyshaempire.netlify.app',
                  'X-Title': 'House of Keysha Empire'
          },
          body: JSON.stringify({
                  model: 'meta-llama/llama-3.1-8b-instruct:free',
                  messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: message }],
                  max_tokens: 350,
                  temperature: 0.75
          })
    });
    if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content;
}

// ── MAIN HANDLER ────────────────────────────────────────────────────

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
          return {
                  statusCode: 200,
                  headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Headers': 'Content-Type',
                            'Access-Control-Allow-Methods': 'POST, OPTIONS'
                  },
                  body: ''
          };
    }

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

    // Fallback chain — tries each provider in order
    const providers = [
      { name: 'Groq-1',      fn: () => tryGroq(message, process.env.GROQ_API_KEY) },
      { name: 'Groq-2',      fn: () => tryGroq(message, process.env.GROQ_API_KEY_2) },
      { name: 'DeepSeek',    fn: () => tryDeepSeek(message, process.env.DEEPSEEK_API_KEY) },
      { name: 'Gemini',      fn: () => tryGemini(message, process.env.GEMINI_API_KEY) },
      { name: 'Mistral-1',   fn: () => tryMistral(message, process.env.MISTRAL_API_KEY) },
      { name: 'Mistral-2',   fn: () => tryMistral(message, process.env.MISTRAL_API_KEY_2) },
      { name: 'OpenRouter',  fn: () => tryOpenRouter(message, process.env.OPENROUTER_API_KEY) }
        ];

    for (const provider of providers) {
          if (!process.env[provider.name.replace('-', '_').toUpperCase().replace('GROQ_1', 'GROQ_API_KEY').replace('GROQ_2', 'GROQ_API_KEY_2')]) {
                  // skip if key not set — use direct check below
          }
          try {
                  const reply = await provider.fn();
                  if (reply && reply.trim()) {
                            console.log(`[Chat] Served by ${provider.name}`);
                            return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
                  }
          } catch (e) {
                  console.error(`[Chat] ${provider.name} failed:`, e.message);
          }
    }

    // All providers failed
    return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
                  reply: 'I am momentarily indisposed attending to Mistress Keysha. Please reach us directly via WhatsApp at +971567620449 or Telegram @keysha_zara and we will respond shortly.'
          })
    };
};
