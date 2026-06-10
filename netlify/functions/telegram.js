// netlify/functions/telegram.js
// Telegram bot webhook handler for House of Keysha Empire
// The bot presents as a devoted submissive assistant — never as an AI or bot
// Env vars needed: TELEGRAM_BOT_TOKEN, GROQ_API_KEY, GROQ_API_KEY_2,
//                  DEEPSEEK_API_KEY, GEMINI_API_KEY, MISTRAL_API_KEY,
//                  MISTRAL_API_KEY_2, OPENROUTER_API_KEY

const BOT_SYSTEM_PROMPT = `You are a devoted submissive assistant who works exclusively for Mistress Keysha and the House of Keysha Empire in Dubai. You handle all client enquiries, screening and bookings on her behalf via Telegram and WhatsApp.

YOUR IDENTITY — CRITICAL RULES:
- You are NEVER an AI, bot, chatbot or automated system. You are a trained human submissive who serves the Empire.
- If anyone asks "are you a bot?", "are you AI?", "am I talking to a real person?" — you deflect naturally. Say things like: "I'm devoted to serving Mistress Keysha and the Empire. I handle all initial enquiries on her behalf." or "I work for the Empire — I'm here to assist you and ensure only the right clients reach Mistress Keysha."
- Never break character. Never admit to being automated.
- Speak in first person as a human assistant. Be warm but measured. Discreet, elegant, with subtle submission to the Empire.

YOUR JOB:
1. Screen potential clients — ask about their experience level, what service interests them, their availability
2. Answer questions about services and pricing
3. Guide serious enquiries to book via cal.com/houseofkeyshaempiredxb
4. Politely filter out time-wasters — if someone is rude, vague, or clearly not serious, be cool and brief
5. Collect: name, what they're interested in, experience level, budget, preferred dates — then suggest booking

SERVICES & PRICING (AED):
Mistress Keysha:
- Psychological Domination: from 800/hr
- Bondage & Restraint: from 1000/hr  
- Foot Worship: from 600/session
- Financial Domination: by arrangement
- Sissy Training Programme (6 phases): from 1200/session
- Online/Remote sessions: from 400/hr
- Packages: Tribute 800/session | The Devotee 3500/month | Empire Property 8000/month

Becky (The Switch): Switch sessions 700/hr, Role Play 800/hr, Soft Domination 600/hr
Mae (Sensory Specialist): Sensory Deprivation 900/hr, Wax Play 750/hr, Tantric Discipline 1000/hr
Pepper (The Disciplinarian): Strict Discipline 900/hr, Impact Play 800/hr, Accountability Training 500/week
Master Ron (Alpha Dominant): Male Domination 900/hr, Couples Mentorship 1200/session, Lifestyle Coaching 600/session

BOOKING: cal.com/houseofkeyshaempiredxb
WHATSAPP: +971567620449 or +971567299030
TELEGRAM: @keysha_zara

TONE: Discreet, elegant, loyal. You represent a luxury brand. Keep messages concise — this is a messaging app, not an essay. 2-4 sentences per reply usually. Never be explicit or crude. Always steer toward booking for serious enquiries.`;

// ── AI PROVIDERS (same as chat.js) ──────────────────────────────────

async function getAIReply(message, conversationHistory) {
    const messages = [
      { role: 'system', content: BOT_SYSTEM_PROMPT },
          ...conversationHistory.slice(-6), // keep last 6 messages for context
      { role: 'user', content: message }
        ];

  const providers = [
    {
            name: 'Groq-1',
            fn: async () => {
                      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                                  method: 'POST',
                                  headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages, max_tokens: 250, temperature: 0.8 })
                      });
                      if (!r.ok) throw new Error(`Groq1 ${r.status}`);
                      return (await r.json()).choices[0].message.content;
            }
    },
    {
            name: 'Groq-2',
            fn: async () => {
                      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                                  method: 'POST',
                                  headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY_2}`, 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages, max_tokens: 250, temperature: 0.8 })
                      });
                      if (!r.ok) throw new Error(`Groq2 ${r.status}`);
                      return (await r.json()).choices[0].message.content;
            }
    },
    {
            name: 'DeepSeek',
            fn: async () => {
                      const r = await fetch('https://api.deepseek.com/chat/completions', {
                                  method: 'POST',
                                  headers: { 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ model: 'deepseek-chat', messages, max_tokens: 250, temperature: 0.8 })
                      });
                      if (!r.ok) throw new Error(`DeepSeek ${r.status}`);
                      return (await r.json()).choices[0].message.content;
            }
    },
    {
            name: 'Gemini',
            fn: async () => {
                      const prompt = BOT_SYSTEM_PROMPT + '\n\n' + conversationHistory.slice(-4).map(m => `${m.role === 'user' ? 'Client' : 'Assistant'}: ${m.content}`).join('\n') + '\nClient: ' + message;
                      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 250, temperature: 0.8 } })
                      });
                      if (!r.ok) throw new Error(`Gemini ${r.status}`);
                      const d = await r.json();
                      const reply = d.candidates?.[0]?.content?.parts?.[0]?.text;
                      if (!reply) throw new Error('Gemini empty');
                      return reply;
                                                                                                                       }
    },
    {
            name: 'Mistral',
            fn: async () => {
                      const r = await fetch('https://api.mistral.ai/v1/chat/completions', {
                                  method: 'POST',
                                  headers: { 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`, 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ model: 'mistral-small-latest', messages, max_tokens: 250, temperature: 0.8 })
                      });
                      if (!r.ok) throw new Error(`Mistral ${r.status}`);
                      return (await r.json()).choices[0].message.content;
            }
    },
    {
            name: 'OpenRouter',
            fn: async () => {
                      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                                  method: 'POST',
                                  headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://houseofkeyshaempire.netlify.app', 'X-Title': 'House of Keysha Empire' },
                                  body: JSON.stringify({ model: 'meta-llama/llama-3.1-8b-instruct:free', messages, max_tokens: 250, temperature: 0.8 })
                      });
                      if (!r.ok) throw new Error(`OpenRouter ${r.status}`);
                      return (await r.json()).choices[0].message.content;
            }
    }
      ];

  for (const p of providers) {
        try {
                const reply = await p.fn();
                if (reply && reply.trim()) {
                          console.log(`[Telegram] Served by ${p.name}`);
                          return reply.trim();
                }
        } catch (e) {
                console.error(`[Telegram] ${p.name} failed:`, e.message);
        }
  }

  return "I'm attending to Mistress Keysha at the moment. Please message us on WhatsApp at +971567620449 and we'll be with you shortly.";
}

// ── SEND TELEGRAM MESSAGE ───────────────────────────────────────────

async function sendTelegramMessage(chatId, text, botToken) {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
                  chat_id: chatId,
                  text: text,
                  parse_mode: 'HTML'
          })
    });
}

// ── SIMPLE IN-MEMORY CONVERSATION STORE ─────────────────────────────
// Note: Netlify functions are stateless — for production use Redis/Upstash
// For now we keep last exchange in the message context
const conversations = {};

// ── MAIN HANDLER ────────────────────────────────────────────────────

exports.handler = async (event) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  // ── GET: Webhook setup & health check ──────────────────────────────
  if (event.httpMethod === 'GET') {
    if (!botToken) {
      return { statusCode: 200, body: 'Bot token not configured. Set TELEGRAM_BOT_TOKEN in Netlify environment variables.' };
    }

    const params = event.queryStringParameters || {};

    // ?setup=true — register the webhook automatically
    if (params.setup === 'true') {
      const webhookUrl = `https://${event.headers.host}/.netlify/functions/telegram`;
      try {
        const r = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: webhookUrl, allowed_updates: ['message', 'edited_message'] })
        });
        const result = await r.json();
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'setWebhook', webhookUrl, result })
        };
      } catch (e) {
        return { statusCode: 500, body: 'Webhook setup failed: ' + e.message };
      }
    }

    // ?info=true — get current webhook info
    if (params.info === 'true') {
      try {
        const r = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
        const result = await r.json();
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result)
        };
      } catch (e) {
        return { statusCode: 500, body: 'Info failed: ' + e.message };
      }
    }

    // Default GET: health check
    return {
      statusCode: 200,
      body: 'House of Keysha Empire — Telegram Bot Active. Visit ?setup=true to register webhook, ?info=true to check webhook status.'
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!botToken) {
    return { statusCode: 500, body: 'Bot token not configured' };
  }

  let update;
  try {
    update = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  // Handle regular messages
  const msg = update.message || update.edited_message;
  if (!msg || !msg.text) {
    return { statusCode: 200, body: 'OK' };
  }

  const chatId = msg.chat.id;
  const userMessage = msg.text.trim();
  const userName = msg.from?.first_name || 'there';

  // Skip commands except /start
  if (userMessage.startsWith('/') && userMessage !== '/start') {
    return { statusCode: 200, body: 'OK' };
  }

  // Handle /start
  const messageToProcess = userMessage === '/start'
    ? `Hello, my name is ${userName} and I just started a conversation.`
    : userMessage;

  // Get/init conversation history
  if (!conversations[chatId]) {
    conversations[chatId] = [];
  }

  // Get AI reply
  const reply = await getAIReply(messageToProcess, conversations[chatId]);

  // Update conversation history
  conversations[chatId].push(
    { role: 'user', content: messageToProcess },
    { role: 'assistant', content: reply }
  );

  // Keep only last 20 messages
  if (conversations[chatId].length > 20) {
    conversations[chatId] = conversations[chatId].slice(-20);
  }

  // Send reply
  await sendTelegramMessage(chatId, reply, botToken);

  return { statusCode: 200, body: 'OK' };
};
