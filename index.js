require('dotenv').config();
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { createClient } = require('@supabase/supabase-js');
const cron = require('node-cron');
const moment = require('moment-timezone');

const app = express();
app.use(express.json());

// Serve static files
app.use(express.static('.'));
app.use('/images', express.static('images'));

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// WhatsApp client with persistent session
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: process.env.WHATSAPP_SESSION_NAME || 'whatsapp-bot-session'
  }),
  puppeteer: {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
});

// QR Code generation
client.on('qr', (qr) => {
  console.log('QR Code received, scan with WhatsApp:');
  qrcode.generate(qr, { small: true });
});

// Client ready
client.on('ready', () => {
  console.log('WhatsApp client is ready!');
  logToSupabase('system', 'Bot started successfully');
});

// Authentication
client.on('authenticated', () => {
  console.log('WhatsApp authenticated successfully');
});

// Authentication failure
client.on('auth_failure', (msg) => {
  console.error('Authentication failure:', msg);
  logToSupabase('error', `Authentication failed: ${msg}`);
});

// Disconnection handler
client.on('disconnected', (reason) => {
  console.log('WhatsApp client disconnected:', reason);
  logToSupabase('error', `Client disconnected: ${reason}`);
});

// Message handler
client.on('message', async (message) => {
  try {
    const contact = await message.getContact();
    const chatId = message.from;
    const messageBody = message.body.toLowerCase().trim();

    // Log incoming message
    await logMessage(chatId, contact.pushname || contact.number, messageBody, 'received');

    // Check if auto-reply is enabled
    if (process.env.AUTO_REPLY_ENABLED !== 'true') {
      return;
    }

    // Check business hours
    if (!isWithinBusinessHours()) {
      await sendAutoReply(chatId, getOutOfOfficeMessage());
      return;
    }

    // Handle different message types
    if (messageBody.includes('payment') || messageBody.includes('pay')) {
      await handlePaymentRequest(chatId);
    } else if (messageBody.includes('book') || messageBody.includes('appointment') || messageBody.includes('reservation')) {
      await handleBookingRequest(chatId, messageBody);
    } else if (messageBody.includes('price') || messageBody.includes('cost')) {
      await handlePricingRequest(chatId);
    } else if (messageBody.includes('hello') || messageBody.includes('hi') || messageBody === 'hey') {
      await handleGreeting(chatId, contact.pushname);
    } else if (messageBody.includes('help') || messageBody === 'menu') {
      await handleHelpRequest(chatId);
    } else if (messageBody.includes('status')) {
      await handleStatusRequest(chatId);
    } else {
      await handleGeneralInquiry(chatId);
    }
  } catch (error) {
    console.error('Error handling message:', error);
    await logToSupabase('error', `Message handling error: ${error.message}`);
  }
});

// Helper Functions

async function sendAutoReply(chatId, message) {
  try {
    await client.sendMessage(chatId, message);
    await logMessage(chatId, 'Bot', message, 'sent');
  } catch (error) {
    console.error('Error sending auto-reply:', error);
  }
}

async function handlePaymentRequest(chatId) {
  const message = `💳 *Payment Options*\n\n` +
    `Please choose your preferred payment method:\n\n` +
    `🔹 Ziina: ${process.env.ZIINA_PAYMENT_LINK}\n` +
    `🔹 PayPal: ${process.env.PAYPAL_PAYMENT_LINK}\n` +
    `🔹 Cash App: ${process.env.CASHAPP_PAYMENT_LINK}\n\n` +
    `After payment, please send a screenshot for confirmation. ✅`;

  await sendAutoReply(chatId, message);
}

async function handleBookingRequest(chatId, messageBody) {
  const message = `📅 *Book an Appointment*\n\n` +
    `Thank you for your interest! To book an appointment:\n\n` +
    `1. Visit our booking system: ${process.env.BOOKING_SYSTEM_URL || 'Coming soon'}\n` +
    `2. Or reply with your preferred:\n` +
    `   - Date (DD/MM/YYYY)\n` +
    `   - Time\n` +
    `   - Service type\n\n` +
    `We'll confirm your booking within 1 hour! ⏰`;

  await sendAutoReply(chatId, message);

  // Store booking inquiry in Supabase
  await storeBookingInquiry(chatId, messageBody);
}

async function handlePricingRequest(chatId) {
  const message = `💰 *Pricing Information*\n\n` +
    `For detailed pricing information, please:\n\n` +
    `1. Specify the service you're interested in\n` +
    `2. Contact us during business hours (${process.env.BUSINESS_HOURS_START} - ${process.env.BUSINESS_HOURS_END} ${process.env.TIMEZONE})\n\n` +
    `Or type 'menu' to see our services.`;

  await sendAutoReply(chatId, message);
}

async function handleGreeting(chatId, name) {
  const message = `👋 Hello ${name || 'there'}!\n\n` +
    `Welcome to *Empire Sites*! 🌟\n\n` +
    `How can we help you today?\n\n` +
    `Type 'help' to see available options.`;

  await sendAutoReply(chatId, message);
}

async function handleHelpRequest(chatId) {
  const message = `📋 *Available Commands*\n\n` +
    `🔹 *payment* - View payment options\n` +
    `🔹 *book* - Book an appointment\n` +
    `🔹 *price* - Get pricing information\n` +
    `🔹 *status* - Check order/booking status\n` +
    `🔹 *help* - Show this menu\n\n` +
    `Business Hours: ${process.env.BUSINESS_HOURS_START} - ${process.env.BUSINESS_HOURS_END} ${process.env.TIMEZONE}\n\n` +
    `We'll respond as soon as possible! 💬`;

  await sendAutoReply(chatId, message);
}

async function handleStatusRequest(chatId) {
  const message = `🔍 *Status Check*\n\n` +
    `To check your order or booking status:\n\n` +
    `Please provide your order/booking ID or reference number.\n\n` +
    `Our team will get back to you shortly! ⏱️`;

  await sendAutoReply(chatId, message);
}

async function handleGeneralInquiry(chatId) {
  const message = `Thank you for your message! 😊\n\n` +
    `Our team will review your inquiry and respond within 2-4 hours during business hours.\n\n` +
    `For immediate assistance, type 'help' to see available options.\n\n` +
    `Business Hours: ${process.env.BUSINESS_HOURS_START} - ${process.env.BUSINESS_HOURS_END} ${process.env.TIMEZONE}`;

  await sendAutoReply(chatId, message);
}

function getOutOfOfficeMessage() {
  return `🌙 *Out of Office*\n\n` +
    `Thank you for contacting us!\n\n` +
    `We're currently outside business hours.\n` +
    `Our team will respond when we're back:\n\n` +
    `⏰ ${process.env.BUSINESS_HOURS_START} - ${process.env.BUSINESS_HOURS_END} ${process.env.TIMEZONE}\n\n` +
    `For urgent matters, you can:\n` +
    `- Leave a detailed message\n` +
    `- Send payment to continue: Type 'payment'\n\n` +
    `We appreciate your patience! 🙏`;
}

function isWithinBusinessHours() {
  if (!process.env.BUSINESS_HOURS_START || !process.env.BUSINESS_HOURS_END) {
    return true; // Always on if not configured
  }

  const timezone = process.env.TIMEZONE || 'Asia/Dubai';
  const now = moment().tz(timezone);
  const start = moment.tz(process.env.BUSINESS_HOURS_START, 'HH:mm', timezone);
  const end = moment.tz(process.env.BUSINESS_HOURS_END, 'HH:mm', timezone);

  return now.isBetween(start, end);
}

// Supabase logging functions
async function logMessage(chatId, sender, content, direction) {
  try {
    const { error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender: sender,
        content: content,
        direction: direction,
        timestamp: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error logging message to Supabase:', error);
  }
}

async function logToSupabase(level, message) {
  try {
    const { error } = await supabase
      .from('logs')
      .insert({
        level: level,
        message: message,
        timestamp: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error logging to Supabase:', error);
  }
}

async function storeBookingInquiry(chatId, details) {
  try {
    const { error } = await supabase
      .from('booking_inquiries')
      .insert({
        chat_id: chatId,
        details: details,
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error storing booking inquiry:', error);
  }
}

// Express routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    whatsapp: client.info ? 'connected' : 'disconnected'
  });
});

app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    whatsapp_connected: !!client.info,
    auto_reply_enabled: process.env.AUTO_REPLY_ENABLED === 'true',
    business_hours: {
      start: process.env.BUSINESS_HOURS_START,
      end: process.env.BUSINESS_HOURS_END,
      timezone: process.env.TIMEZONE,
      currently_open: isWithinBusinessHours()
    }
  });
});

app.post('/send-message', async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message are required' });
    }

    const chatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
    await client.sendMessage(chatId, message);

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cron jobs for scheduled tasks
cron.schedule('0 9 * * *', async () => {
  console.log('Running daily morning check...');
  await logToSupabase('info', 'Daily morning check completed');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize WhatsApp client
client.initialize();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await client.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await client.destroy();
  process.exit(0);
});
