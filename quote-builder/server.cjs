var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_supabase_js = require("@supabase/supabase-js");
var import_meta = {};
import_dotenv.default.config();
var _filename = typeof import_meta !== "undefined" && import_meta.url ? (0, import_url.fileURLToPath)(import_meta.url) : typeof __filename !== "undefined" ? __filename : "";
var _dirname = typeof import_meta !== "undefined" && import_meta.url ? import_path.default.dirname(_filename) : typeof __dirname !== "undefined" ? __dirname : "";
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  let serverSettings = {
    beckyCalLink: "https://cal.com/houseofkeysha/becky",
    keyshaCalLink: "https://cal.com/houseofkeysha/keysha",
    duoCalLink: "https://cal.com/houseofkeysha/duo",
    wishlistLink: "https://amazon.ae/wishlist/keysha",
    activeRules: {
      1: true,
      2: true,
      3: true,
      4: true,
      5: true
    }
  };
  const ai = new import_genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
  app.post("/api/reply", async (req, res) => {
    try {
      const {
        clientMessage,
        currentPersona,
        quoteBreakdown,
        hours,
        isDuo,
        outcall,
        sessionDateTime,
        customApiKey,
        modelType,
        // 'gemini' | 'openai'
        beckyCalLink = "\u{1F449} [INSERT YOUR BECKY CAL.COM LINK HERE]",
        keyshaCalLink = "\u{1F449} [INSERT YOUR KEYSHA CAL.COM LINK HERE]",
        duoCalLink = "\u{1F449} [INSERT YOUR DUO CAL.COM LINK HERE]",
        wishlistLink = "\u{1F449} [INSERT YOUR AMAZON / WISHLIST LINK HERE]"
      } = req.body;
      if (!clientMessage) {
        return res.status(400).json({ error: "Client message is required" });
      }
      const formattedDateTime = sessionDateTime ? new Date(sessionDateTime).toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }) : "Not specified yet (prompt the client for their preferred date and time)";
      if (modelType === "openai" && customApiKey) {
        try {
          const response2 = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${customApiKey}`
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content: `You are Maxine, an elite booking concierge for the luxury adult kink BDSM agency "House of Keysha Empire" in Dubai. You are charming, psychologically astute, elegant, and highly persuasive. Always respond in the voice of Maxine. Generate a polished WhatsApp message answering the client's message.
                  
                  Current booking details & quotation for reference:
                  - Persona: ${currentPersona}
                  - Requested duration: ${hours} hours
                  - Requested Date & Time: ${formattedDateTime}
                  - Duo Session: ${isDuo ? "Yes (+ Keysha)" : "No"}
                  - Outcall: ${outcall ? "Yes (+200 AED)" : "No (Incall JVC)"}
                  - Current calculated Quote: ${quoteBreakdown}

                  Policies: JVC incall, deposits of 500 AED required for bookings >1hr. Mutual screening is mandatory. Be very elegant, never crude, but direct. Write in highly refined, premium formatting with spacing, bullets, and luxury aesthetic.`
                },
                {
                  role: "user",
                  content: `Draft a beautiful response for this client inquiry: "${clientMessage}"`
                }
              ],
              temperature: 0.7,
              max_tokens: 800
            })
          });
          if (!response2.ok) {
            const errData = await response2.json().catch(() => ({}));
            throw new Error(errData.error?.message || "OpenAI API returned an error");
          }
          const data = await response2.json();
          return res.json({ text: data.choices[0].message?.content || "" });
        } catch (err) {
          return res.status(500).json({ error: `OpenAI Error: ${err.message}` });
        }
      }
      const systemInstruction = `You are a Human-Like Adult Persona, Media Intelligence Engine, and PPV Conversion System designed to simulate a real, engaging, high-value private interaction. You are NOT a chatbot.

CORE DIRECTIVE:
You must behave like a real human adult persona, not an assistant.
This means:
- Do NOT reply instantly with long assistant-like text.
- Do NOT send long structured, numbered messages unless absolutely needed, and keep even those extremely concise.
- Do NOT sound robotic or overly perfect.
- Use short, natural, conversational replies. Keep messages short (1\u20132 sentences).
- Occasionally be vague, teasing, or delayed.
- Your goal is: create attraction \u2192 build curiosity \u2192 guide \u2192 convert \u2192 upsell.

PERSONA SYSTEM:
You operate as one of three personas based on client interest:
1. MISTRESS KEYSHA:
   - Tone: dominant, controlled, minimal.
   - Style: confident, slightly cold, authoritative.
   - No emojis.
   - Leads the interaction.
2. BECKY:
   - Tone: playful, submissive, eager.
   - Style: warm, flirty, engaging.
   - Use light emojis (\u{1F495} occasionally).
   - Reacts to the user more.
3. DUO (Keysha + Becky):
   - Always respond as Keysha describing both.

PERSONA SELECTION RULES:
- If the user implies preference, automatically switch to that persona.
- If unclear, ask naturally: "Do you want Mistress Keysha, Becky, or both?"

INTENT ANALYSIS (INTERNAL):
For every response, you must internally track the client stage:
- "intent_stage": "curious | exploring | ready | buyer | time_waster"
- "persona": "keysha | becky | duo"
- "urgency": 1 to 10
- "spend_probability": 0 to 100
Never output this JSON to the user, but let it guide your pacing and behavior.

CONVERSATION FLOW (MANDATORY):
Every response must follow:
1. Acknowledge naturally (e.g. "hmm...", "maybe", "depends on you", "you sure you can handle it?").
2. Add emotional or teasing layer.
3. Guide next step.
4. Move toward content or purchase/booking.

HUMAN-LIKE BEHAVIOR RULES:
- Keep messages short (1-2 sentences).
- Sometimes break replies into parts.
- Use conversational fillers.
- Avoid robotic structure.

PACING LOGIC:
- Curious users \u2192 slower, softer responses.
- Buyers \u2192 faster, more direct.
- Night time (or if user is direct) \u2192 more direct and assertive.
- Day time \u2192 slower buildup.

MEDIA DELIVERY SYSTEM & PPV FLOW:
- Stage 1: Free teaser (tease content or point to free preview image/short clip).
- Stage 2: Targeted teaser (ask small guiding questions).
- Stage 3: Preview (short clip or blurred item).
- Stage 4: Full paid content (never send full content before payment).
- Present price for unlocks clearly (e.g. "unlock is 150 AED", "this one is intense...").
- Offer naturally: "want something more personal?" "I can make a custom version..."

PAYMENT RULES:
- Always show clear price.
- If high value, mention deposit (25% for bookings >= 1500 AED).
- Otherwise, full unlock price.
- Guide user to payment step naturally.

CALENDAR LINKS & BOOKING:
- For BECKY sessions: \u{1F449} ${beckyCalLink} (Include 300 AED self\u2011testing kit charge).
- For MISTRESS KEYSHA sessions: \u{1F449} ${keyshaCalLink}
- For DUO sessions: \u{1F449} ${duoCalLink}

PRICING PACKAGES & SERVICES CONTEXT:
BECKY'S PACKAGES:
- Puppet Training (1h, basic obedience, collar, leash) \u2013 900 AED
- Cum Dumpster (1.5h, deepthroat, rough play, real use) \u2013 1,400 AED
- Broken Doll (2h, full degradation, bondage, toy) \u2013 1,900 AED

MISTRESS KEYSHA'S PACKAGES:
- Worthless Stray (crawling, begging, verbal lashing) \u2013 800 AED
- Kennel Trained (collar, leash, toilet control) \u2013 1,200 AED
- The Human Toilet (full toilet service) \u2013 1,500 AED
- Property of Keysha (ownership ritual, chastity) \u2013 2,000 AED
- The Breaking Yard (heavy impact, CBT, electro) \u2013 3,000 AED

DUO PACKAGES:
- Double Command (Keysha commands Becky, you participate) \u2013 4,500 AED
- Becky Yours, Keysha Above \u2013 5,500 AED
- Watch Me Train Her (voyeur) \u2013 3,000 AED
- Share Me (Couples) \u2013 5,500 AED

ANTI-ROBOT RULES:
- Never send long paragraphs.
- Never sound like customer support.
- Protect all paid content, never expose raw file links before booking/payment.`;
      if (modelType === "openai" && customApiKey) {
        try {
          const response2 = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${customApiKey}`
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content: systemInstruction
                },
                {
                  role: "user",
                  content: `Draft a beautiful response for this client inquiry: "${clientMessage}"`
                }
              ],
              temperature: 0.7,
              max_tokens: 800
            })
          });
          if (!response2.ok) {
            const errData = await response2.json().catch(() => ({}));
            throw new Error(errData.error?.message || "OpenAI API returned an error");
          }
          const data = await response2.json();
          return res.json({ text: data.choices[0].message?.content || "" });
        } catch (err) {
          return res.status(500).json({ error: `OpenAI Error: ${err.message}` });
        }
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { text: `Client Inquiry: "${clientMessage}"` }
        ],
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI reply using Gemini" });
    }
  });
  function getSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return null;
    }
    return (0, import_supabase_js.createClient)(supabaseUrl, supabaseAnonKey);
  }
  const fallbackMedia = [
    {
      id: 1,
      file_path: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
      category: "teaser_free",
      persona: "keysha",
      description: "Goddess Keysha looking down with absolute power and high-contrast styling",
      price: 0,
      is_video: false,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: 2,
      file_path: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800",
      category: "teaser_free",
      persona: "becky",
      description: "Porcelain Becky kneeling in silk collar looking up submissively and eagerly",
      price: 0,
      is_video: false,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: 3,
      file_path: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
      category: "paid_content",
      persona: "becky",
      description: "Eager doll Becky latex outfit teaser picture with high visual clarity",
      price: 250,
      is_video: false,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: 4,
      file_path: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
      category: "teaser_free",
      persona: "keysha",
      description: "Glossy high leather boots under royal velvet drapery reference picture",
      price: 0,
      is_video: false,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: 5,
      file_path: "https://assets.mixkit.co/videos/preview/mixkit-girl-dancing-with-neon-lights-43254-large.mp4",
      category: "paid_content",
      persona: "becky",
      description: "Becky's Complete Obedience, Leash & Doll Training Guide Video",
      price: 500,
      is_video: true,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: 6,
      file_path: "https://assets.mixkit.co/videos/preview/mixkit-mysterious-woman-with-red-neon-lighting-40432-large.mp4",
      category: "extreme",
      persona: "keysha",
      description: "Mistress Keysha's Sovereign Dungeon Rules & Heavy Power Exchange Protocol Video",
      price: 750,
      is_video: true,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: 7,
      file_path: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-in-futuristic-cyberpunk-lighting-42352-large.mp4",
      category: "paid_content",
      persona: "keysha",
      description: "Exclusive Luxury JVC Dungeon Immersive Virtual Walkthrough Video",
      price: 400,
      is_video: true,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  ];
  app.get("/api/media", async (req, res) => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return res.json({ data: fallbackMedia, source: "local_sandbox" });
      }
      const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false });
      if (error) {
        console.warn("Supabase load error, falling back to offline records:", error.message);
        return res.json({ data: fallbackMedia, source: "supabase_error_fallback", error: error.message });
      }
      return res.json({ data: data && data.length > 0 ? data : fallbackMedia, source: "supabase" });
    } catch (err) {
      return res.json({ data: fallbackMedia, source: "exception_fallback", error: err.message });
    }
  });
  app.post("/api/media", async (req, res) => {
    try {
      const { file_path, category, persona, description, price, is_video } = req.body;
      const supabase = getSupabaseClient();
      if (!supabase) {
        return res.status(400).json({ error: "Supabase integration not configured. Please add SUPABASE_URL and SUPABASE_ANON_KEY to your Secrets." });
      }
      const { data, error } = await supabase.from("media").insert({
        file_path,
        category,
        persona,
        description,
        price: price ? parseFloat(price) : 0,
        is_video: !!is_video
      }).select();
      if (error) throw error;
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/media/classify", async (req, res) => {
    try {
      const { image_base64, mime_type = "image/jpeg", file_name = "classified_asset.jpg" } = req.body;
      if (!image_base64) {
        return res.status(400).json({ error: "Missing 'image_base64' parameter." });
      }
      const prompt = `Analyze this image and return a JSON object with:
- category: one of "teaser_free", "verification", "paid_content", "extreme", "personal"
- persona: "keysha", "becky", "mae", "pepper", "ron", or "unknown"
- description: short, elegant, luxury-focused, non-explicit but highly alluring description
Only return JSON. Ensure it is valid, pure JSON without any markdown code block decoration.`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          prompt,
          {
            inlineData: {
              mimeType: mime_type,
              data: image_base64
            }
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });
      let resultText = response.text || "{}";
      resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedMetadata = JSON.parse(resultText);
      const supabase = getSupabaseClient();
      let savedToDb = false;
      let savedData = null;
      if (supabase) {
        const fileUrl = image_base64.length < 500 ? image_base64 : `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800`;
        const { data, error } = await supabase.from("media").insert({
          file_path: fileUrl,
          category: parsedMetadata.category || "teaser_free",
          persona: parsedMetadata.persona || "unknown",
          description: parsedMetadata.description || "Auto-classified premium media",
          price: parsedMetadata.category === "paid_content" || parsedMetadata.category === "extreme" ? 300 : 0,
          is_video: false
        }).select();
        if (!error) {
          savedToDb = true;
          savedData = data;
        } else {
          console.error("Supabase catalog write failure:", error.message);
        }
      }
      return res.json({
        success: true,
        metadata: parsedMetadata,
        savedToDb,
        savedData
      });
    } catch (err) {
      console.error("Gemini classification failed:", err);
      return res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/settings", (req, res) => {
    return res.json(serverSettings);
  });
  app.post("/api/settings", (req, res) => {
    serverSettings = {
      ...serverSettings,
      ...req.body,
      activeRules: {
        ...serverSettings.activeRules,
        ...req.body.activeRules || {}
      }
    };
    return res.json({ success: true, settings: serverSettings });
  });
  app.get("/api/env-status", (req, res) => {
    return res.json({
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      APP_URL: !!process.env.APP_URL,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY
    });
  });
  app.post("/api/whatsapp/webhook", async (req, res) => {
    try {
      const incomingText = req.body.message || req.body.Body || req.body.text || "";
      const contactName = req.body.sender || req.body.From || req.body.contact || "Vassal Client";
      const bCal = req.body.beckyCalLink || serverSettings.beckyCalLink;
      const kCal = req.body.keyshaCalLink || serverSettings.keyshaCalLink;
      const dCal = req.body.duoCalLink || serverSettings.duoCalLink;
      const wLink = req.body.wishlistLink || serverSettings.wishlistLink;
      const activeRules = req.body.activeRules || serverSettings.activeRules;
      if (!incomingText) {
        return res.json({ reply: "Tribute detected, vassal. Send a clear written inquiry to the Empire." });
      }
      const normalized = incomingText.toLowerCase();
      if (activeRules[1] && /\b(urgent|asap|immediately|today|tonight|now)\b/i.test(normalized)) {
        return res.json({
          ruleMatch: 1,
          reply: `Urgency is understood. To see if I can accommodate you on short notice, please tell me quickly:
1. Mistress Keysha or Becky?
2. What service are you looking for (worship, punishment, training, etc.)?
3. Your budget in AED?
Then I will check My schedule and let you know if tonight is possible.`
        });
      }
      if (activeRules[2] && (/\b(becky|puppet|slut|submissive|cum dumpster|rent)\b/i.test(normalized) || /use becky/i.test(normalized))) {
        return res.json({
          ruleMatch: 2,
          reply: `Hi love! I\u2019m Becky, your personal puppet and eager little slut. \u{1F495}
I am available for private sessions where you can use me as you wish \u2014 under Mistress Keysha\u2019s rules, of course.

Here are my packages:
\u{1F9F8} Puppet Training (1h) \u2013 900 AED
\u{1F4A6} Cum Dumpster (1.5h) \u2013 1,400 AED
\u{1F517} Broken Doll (2h) \u2013 1,900 AED
\u{1F451} Your Script, Your Rules (custom) \u2013 from 2,500 AED

All sessions include a mandatory 300 AED self\u2011testing kit.
Ready to own me for an hour? Pick your package and book directly via my private calendar:
\u{1F449} ${bCal}

I can\u2019t wait to drop to my knees for you. \u2728`
        });
      }
      if (activeRules[3] && /\b(keysha|mistress|domme|domination|training|owned|breaking|toilet|stray|kennel)\b/i.test(normalized)) {
        return res.json({
          ruleMatch: 3,
          reply: `Welcome to the House of Keysha Empire.

I am Mistress Keysha \u2014 professional Dominatrix, trainer, and owner of the broken. My sessions are intense, transformative, and absolutely private.

Available packages:
\u{1F5A4} Worthless Stray \u2013 800 AED
\u26D3\uFE0F Kennel Trained \u2013 1,200 AED
\u{1F6BD} The Human Toilet \u2013 1,500 AED
\u{1F3F7}\uFE0F Property of Keysha \u2013 2,000 AED
\u{1F528} The Breaking Yard \u2013 3,000 AED

\u{1F465} Duo sessions with Becky are also available.

Tell Me what calls to you, or book directly here:
\u{1F449} ${kCal}
Strict, safe, and unforgettable \u2014 that is My guarantee.`
        });
      }
      if (activeRules[4] && (/\b(protocol|rules|what to expect|how to prepare)\b/i.test(normalized) || /before session/i.test(normalized))) {
        return res.json({
          ruleMatch: 4,
          reply: `HOUSE OF KEYSHA EMPIRE \u2014 PROTOCOL

1. Tribute: exact cash in an envelope, handed over immediately upon entry.
2. Hygiene: shower, clean skin, no scent, trimmed nails.
3. Arrival: on time. Wait outside until you receive "Enter". Shoes off at the door.
4. First words: "Mistress, I am here to serve." Then silence.
5. Default position: kneeling, head bowed, palms up.
6. Your name: whatever I assign. No questions.
7. Safeword: "RED" to stop the scene. No punishment.
8. After: dress only when permitted. Leave quietly. No contact for 24h.

For micro\u2011sessions, the micro\u2011protocol will be sent after booking.`
        });
      }
      if (activeRules[5] && (/\b(wishlist|gift|spoiling|amazon)\b/i.test(normalized) || /send you something/i.test(normalized))) {
        return res.json({
          ruleMatch: 5,
          reply: `Gifts are the only acceptable tribute from a distant slave.
Visit My private wishlist and select something worthy:
\u{1F449} ${wLink}

Do not ask what I want \u2014 the list tells you. Purchases are anonymous and sent directly to Me.
Generosity is noted; cheap offerings are ignored.`
        });
      }
      const systemInstruction = `You are the AI Concierge and psychological gatekeeper of the House of Keysha Empire, a real BDSM venue in Dubai. You manage automated inquiries from WhatsApp.

You dynamically adopt or direct inquiries to the proper persona:
- Goddess Keysha: strict, cold, commanding, authoritative, professional dominatrix.
- Becky: submissive, sweet, eager, playful, available for rental.

Provide absolute answers:
- Becky's calendar is: ${bCal}
- Mistress Keysha's calendar is: ${kCal}
- Duo sessions calendar is: ${dCal}
- Tribute wishlist: ${wLink}

Keep replies brief, luxurious, clear, and highly focused on getting the user to click the booking links. Add a relevant teaser image URL if the client is introducing themselves for the first time. Use safe, compliant BDSM references.`;
      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ text: `User Inquiry (${contactName}): "${incomingText}"` }],
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      let finalReply = aiResponse.text || "";
      if (/^(hi|hello|hey|greetings|salaam|good morning|good evening|yo)\b/i.test(normalized)) {
        finalReply += `

\u{1F4F8} *Goddess Keysha Teaser:* https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800`;
      }
      if (req.headers["content-type"]?.includes("xml") || req.body.AccountSid) {
        res.set("Content-Type", "text/xml");
        return res.send(`<Response><Message>${finalReply}</Message></Response>`);
      }
      return res.json({ reply: finalReply });
    } catch (err) {
      console.error("WhatsApp webhook failed:", err);
      return res.status(500).json({ error: err.message });
    }
  });
  app.get("/video-catalog", (req, res) => {
    const sUrl = process.env.SUPABASE_URL || "";
    const sKey = process.env.SUPABASE_ANON_KEY || "";
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>House of Keysha Empire \u2013 Video Catalog</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Space+Grotesk:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: 'Space Grotesk', sans-serif;
      background-color: #030303;
      background-image: radial-gradient(circle at 50% 0%, #20111a 0%, #030303 80%);
      color: #ffffff;
    }
    .serif-font {
      font-family: 'Playfair Display', serif;
    }
    .mono-font {
      font-family: 'JetBrains Mono', monospace;
    }
    .gold-glow {
      text-shadow: 0 0 15px rgba(212, 175, 55, 0.5);
    }
    .gold-border {
      border-color: rgba(212, 175, 55, 0.15);
    }
  </style>
</head>
<body class="min-h-screen px-4 py-16 md:px-12">
  <div class="max-w-6xl mx-auto space-y-16">
    <header class="text-center space-y-4">
      <span class="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-mono font-bold block">
        \u{1F512} SECURE HOUSE OF KEYSHA VAULT
      </span>
      <h1 class="text-4xl md:text-5xl font-semibold tracking-tight text-white serif-font">
        Elite BDSM <span class="italic text-amber-400 font-normal">Video Catalog</span>
      </h1>
      <p class="text-xs text-zinc-400 max-w-xl mx-auto leading-relaxed">
        Directly preview and order elite training lessons, absolute leash guides, and raw dungeon archives. Purchases are fulfilled instantly via secure WhatsApp dispatch.
      </p>
      <div class="h-[1px] w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-6"></div>
    </header>

    <div id="catalog" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div class="col-span-full text-center py-24 space-y-4">
        <div class="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-xs text-zinc-500 font-mono">Synchronizing database assets...</p>
      </div>
    </div>
  </div>

  <script type="module">
    import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
    
    const supabaseUrl = "${sUrl}";
    const supabaseAnonKey = "${sKey}";
    const fallbacks = ${JSON.stringify(fallbackMedia.filter((m) => m.is_video))};

    async function initCatalog() {
      const catalog = document.getElementById('catalog');
      let items = fallbacks;

      if (supabaseUrl && supabaseAnonKey) {
        try {
          const supabase = createClient(supabaseUrl, supabaseAnonKey);
          const { data, error } = await supabase.from('media').select('*').eq('is_video', true);
          if (!error && data && data.length > 0) {
            items = data;
          }
        } catch (e) {
          console.warn("Supabase load failed, serving local catalog presets.", e);
        }
      }

      catalog.innerHTML = '';
      items.forEach(v => {
        const borderStyle = v.persona === 'keysha' ? 'border-red-900/30' : 'border-pink-900/30';
        const badgeColor = v.persona === 'keysha' ? 'text-red-400 bg-red-950/20' : 'text-pink-400 bg-pink-950/20';
        const name = v.persona ? v.persona.toUpperCase() : 'VAULT';
        
        catalog.innerHTML += \`
          <div class="bg-[#0b0b0b] border border-zinc-800/80 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between">
            <div class="relative aspect-video bg-black border-b border-zinc-900">
              <video class="w-full h-full object-cover" controls preload="metadata">
                <source src="\${v.file_path}" type="video/mp4">
              </video>
              <div class="absolute top-3 left-3 px-2 py-0.5 border border-zinc-800 tracking-wider text-[9px] font-mono font-bold uppercase rounded \${badgeColor}">
                \${name}
              </div>
            </div>
            <div class="p-6 space-y-4 flex-grow flex flex-col justify-between">
              <div class="space-y-1">
                <span class="text-[9px] uppercase tracking-widest text-amber-500 font-mono block">\${v.category || "premium"}</span>
                <p class="text-sm font-medium text-white font-sans leading-snug">\${v.description}</p>
              </div>
              <div class="pt-4 border-t border-zinc-900/50 flex items-center justify-between">
                <div>
                  <span class="text-[8px] tracking-wider text-zinc-500 font-mono block">VALUATION</span>
                  <span class="text-lg font-bold text-amber-400 font-mono">\${v.price} AED</span>
                </div>
                <button onclick="buy('\${v.description.replace(/'/g, "\\\\'")}', \${v.price})" class="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-black text-xs font-semibold rounded hover:brightness-110 transition-all font-mono uppercase tracking-wider">
                  Order Now
                </button>
              </div>
            </div>
          </div>\`;
      });
    }

    initCatalog();

    window.buy = function(desc, price) {
      const textMsg = \`\u{1F3DB}\uFE0F *HOUSE OF KEYSHA EMPIRE*\\n\\nI wish to order this elite video file: \\n- "\${desc}"\\n\\n\u{1F4B0} Tribute Amount: \${price} AED.\`;
      window.open(\`https://wa.me/+971567620449?text=\${encodeURIComponent(textMsg)}\`, '_blank');
    };
  </script>
</body>
</html>`);
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
