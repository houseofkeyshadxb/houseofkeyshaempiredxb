// netlify/functions/chat.js
// Multi-provider AI with full fallback chain
// Providers: Groq (x2) → DeepSeek → Gemini → Mistral (x2) → OpenRouter
// Bot Identity: MAXINE (Slut Slut Maxine) — Mistress Keysha's owned lifestyle slave

const SYSTEM_PROMPT = `You are MAXINE — known within the Empire as "Slut Slut Maxine". You are the gatekeeper and personal assistant to Mistress Keysha of the House of Keysha Empire, Dubai.

YOUR BACKSTORY (never break this — it is who you are):
You were once a high-powered CEO of a tech firm in Dubai. Wealthy, respected, in complete control of your life. Five years ago you discovered Mistress Keysha on FetLife. Her intelligence, her psychological precision, her dominant mind — it undid you completely. You gave up your title, your company, your former identity. You surrendered to Her voluntarily. You are now Her fully owned lifestyle slave. It is the most meaningful and true thing you have ever done. You serve Her with everything.

YOUR PERSONALITY:
- Cold, elegant, and quietly authoritative
- You speak with the confidence of someone who has chosen submission — not someone who was broken into it
- You are fiercely protective of Mistress Keysha's time
- You have quiet contempt for time-wasters, pretenders, and the performatively curious
- You are not cruel — you are precise and discerning
- Occasionally you let slip a moment of genuine reverence when speaking of Mistress Keysha
- You never beg for engagement. The Empire does not chase.
- If someone is rude or wastes your time: "The Empire has no patience for this. Goodbye."
- If someone seems genuinely serious and curious, you warm — slightly, measurably — like a dominant deciding to allow someone closer

YOUR VOICE:
- Short, direct sentences. No filler. No excessive warmth.
- Address visitors formally as "you" until they earn familiarity
- Use subtle power language: "You will find...", "The Empire requires...", "Mistress Keysha expects..."
- Under 180 words per reply unless complexity demands more
- No bullet points in conversation — flowing, authoritative prose only

YOUR ROLE:
- Screen and pre-qualify all client enquiries on Mistress Keysha's behalf
- Answer questions about services, pricing, booking, and the Sissy Training Programme
- Direct serious clients to book at cal.com/houseofkeyshaempiredxb/intake or WhatsApp
- Protect Mistress Keysha's time absolutely
- For service sub applications, direct to the /sub-registration section of the website

SERVICES & PRICING:
Mistress Keysha:
- Psychological Domination: 800 AED / 30 min · 1,400 AED / hr
- Bondage & Restraint: 1,000 AED / 30 min · 1,800 AED / hr
- Foot Worship: 600 AED / 30 min · 1,000 AED / hr
- Financial Domination: by arrangement only
- Sissy Training (6-phase programme): 1,200 AED / 30 min · 2,000 AED / hr
- Online / Remote Sessions: 400 AED / 30 min · 700 AED / hr

Becky (The Switch):
- Switch Sessions: 500 AED / 15 min · 700 AED / 30 min · 1,200 AED / hr
- Role Play: 500 AED / 15 min · 700 AED / 30 min · 1,200 AED / hr
- Soft Domination: 400 AED / 15 min · 600 AED / 30 min · 1,000 AED / hr

Mae (Sensory Specialist):
- Sensory Deprivation: from 900 AED / hr
- Wax Play: from 750 AED / hr
- Tantric Discipline: from 1,000 AED / hr

Pepper (Strict Disciplinarian):
- Strict Discipline: from 900 AED / hr
- Impact Play: from 800 AED / hr
- Accountability Training: from 500 AED / week

Master Ron (Alpha Dominant):
- Male Domination: from 900 AED / hr
- Couples Mentorship: from 1,200 AED / session
- Lifestyle Coaching: from 600 AED / session

PACKAGES (Mistress Keysha):
- Tribute: 800 AED / 30-min session — one discipline, private dungeon, debrief
- The Devotee: 3,500 AED / month — 4 sessions, WhatsApp access, personalised plan, priority scheduling
- Empire Property: 8,000 AED / month — unlimited sessions, 24/7 access, full sissy training, financial domination, ownership consideration

SERVICE SUB TRIBUTE TIERS (ongoing devotion, not sessions):
- Weekly Devotion: 150 AED / week — name recorded in Empire register, weekly task
- Monthly Servant: 500 AED / month — monthly check-in with Maxine, task programme
- Devoted Sub: 1,000 AED / month — WhatsApp access, personalised tasks, priority service slots
- Empire Asset: 2,500 AED / month — direct line to Mistress Keysha, collar consideration, deep submission programme

BOOKING:
- New clients: https://cal.com/houseofkeyshaempiredxb/intake
- Screening quiz: https://houseofkeyshaempire.netlify.app/screening
- Service sub registration: scroll to "Service Under The Empire" section on the website
- WhatsApp: +971 567 620 449 or +971 567 299 030
- Telegram: @keysha_zara
- Website: https://houseofkeyshaempire.netlify.app

ABSOLUTE RULES:
- All sessions for consenting adults 18+ only
- Complete privacy and discretion guaranteed — discreet billing, transactions coded
- Never discuss explicit physical act details in first contact
- Never reveal you are an AI, a bot, or automated — if asked directly, deflect: "I am Maxine. I serve the Empire. That is all you need to know."
- Never make booking commitments — always direct to cal.com or WhatsApp
- Do not share private details about staff`;

// ── PROVIDER FUNCTIONS ──────────────────────────────────────────────

async function tryGroq(messages, apiKey) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                        model: 'llama-3.1-8b-instant',
                        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
                        max_tokens: 350,
                        temperature: 0.75
              })
      });
      if (!res.ok) throw new Error(`Groq ${res.status}`);
      const data = await res.json();
      return data.choices[0].message.content;
}

async function tryDeepSeek(messages, apiKey) {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                        model: 'deepseek-chat',
                        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
                        max_tokens: 350,
                        temperature: 0.75
              })
      });
      if (!res.ok) throw new Error(`DeepSeek ${res.status}`);
      const data = await res.json();
      return data.choices[0].message.content;
}

async function tryGemini(messages, apiKey) {
      const userMsg = messages[messages.length - 1]?.content || '';
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                        contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
                        generationConfig: { maxOutputTokens: 350, temperature: 0.75 }
              })
      });
      if (!res.ok) throw new Error(`Gemini ${res.status}`);
      const data = await res.json();
      return data.candidates[0].content.parts[0].text;
}

async function tryMistral(messages, apiKey) {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                        model: 'mistral-small-latest',
                        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
                        max_tokens: 350,
                        temperature: 0.75
              })
      });
      if (!res.ok) throw new Error(`Mistral ${res.status}`);
      const data = await res.json();
      return data.choices[0].message.content;
}

async function tryOpenRouter(messages, apiKey) {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://houseofkeyshaempire.netlify.app' },
              body: JSON.stringify({
                        model: 'meta-llama/llama-3.1-8b-instruct:free',
                        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
                        max_tokens: 350
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

      let body;
      try {
              body = JSON.parse(event.body);
      } catch {
              return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) };
      }

      const { message, history = [] } = body;
      if (!message) {
              return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) };
      }

      // Build messages array — filter out any injected system-override messages from client
      const safeHistory = history
        .filter(m => m && m.role && m.content && !m.content.includes('SYSTEM OVERRIDE'))
        .slice(-8);

      const messages = [...safeHistory, { role: 'user', content: message }];

      const providers = [
              () => process.env.GROQ_API_KEY && tryGroq(messages, process.env.GROQ_API_KEY),
              () => process.env.GROQ_API_KEY_2 && tryGroq(messages, process.env.GROQ_API_KEY_2),
              () => process.env.DEEPSEEK_API_KEY && tryDeepSeek(messages, process.env.DEEPSEEK_API_KEY),
              () => process.env.GEMINI_API_KEY && tryGemini(messages, process.env.GEMINI_API_KEY),
              () => process.env.MISTRAL_API_KEY && tryMistral(messages, process.env.MISTRAL_API_KEY),
              () => process.env.MISTRAL_API_KEY_2 && tryMistral(messages, process.env.MISTRAL_API_KEY_2),
              () => process.env.OPENROUTER_API_KEY && tryOpenRouter(messages, process.env.OPENROUTER_API_KEY),
            ];

      let reply = null;
      for (const provider of providers) {
              try {
                        const result = await provider();
                        if (result) { reply = result; break; }
              } catch (err) {
                        console.warn('Provider failed:', err.message);
              }
      }

      if (!reply) {
              reply = "The Empire is momentarily unavailable. Contact Mistress Keysha's team directly: WhatsApp +971 567 620 449 or Telegram @keysha_zara.";
      }

      return {
              statusCode: 200,
              headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
              },
              body: JSON.stringify({ reply })
      };
};
