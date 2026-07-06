require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5';

// Free-plan-style usage cap — mirrors Claude.ai's free plan so you never
// burn through more of your API credit than a "free plan" would allow.
// Default: 40 messages per 5-hour rolling window, per visitor (by IP).
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '40', 10);
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || String(5 * 60 * 60 * 1000), 10);
const usageMap = new Map(); // ip -> { count, windowStart }

function checkRateLimit(ip) {
  const now = Date.now();
  let entry = usageMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry = { count: 0, windowStart: now };
  }
  entry.count += 1;
  usageMap.set(ip, entry);
  const resetInMs = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
  return { allowed: entry.count <= RATE_LIMIT_MAX, resetInMs };
}

function formatDuration(ms) {
  const mins = Math.ceil(ms / 60000);
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'}`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs} hour${hrs === 1 ? '' : 's'}${remMins ? ` ${remMins} min` : ''}`;
}

if (!ANTHROPIC_API_KEY) {
  console.warn('\n⚠️  ANTHROPIC_API_KEY is not set.');
  console.warn('   1. Copy .env.example to .env');
  console.warn('   2. Add your key from https://console.anthropic.com/settings/keys');
  console.warn('   3. Restart the server (npm start)\n');
}

// EduGenie (geniED chat, quiz generation, note summaries) all call this
// single endpoint. The Anthropic API key stays on the server and is
// NEVER sent to the browser.
app.post('/api/chat', async (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: { message: 'Server is missing ANTHROPIC_API_KEY. Add it to your .env file and restart the server.' }
    });
  }

  const { messages, system, max_tokens } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: { message: 'messages array is required' } });
  }

  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return res.status(429).json({
      error: { message: `You've hit the free-plan limit (${RATE_LIMIT_MAX} messages per ${formatDuration(RATE_LIMIT_WINDOW_MS)}). Please try again in ${formatDuration(rl.resetInMs)}.` }
    });
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: max_tokens || 1024,
        ...(system ? { system } : {}),
        messages
      })
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      console.error('Anthropic API error:', data);
      return res.status(anthropicRes.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: { message: 'Failed to reach the Anthropic API', details: err.message } });
  }
});

app.get('/health', (req, res) => {
  res.json({ ok: true, hasApiKey: Boolean(ANTHROPIC_API_KEY), model: MODEL, rateLimit: { max: RATE_LIMIT_MAX, windowHours: RATE_LIMIT_WINDOW_MS / 3600000 } });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 EduGenie is running: http://localhost:${PORT}\n`);
});
