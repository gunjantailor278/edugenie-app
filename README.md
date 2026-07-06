 # EduGenie — Setup Guide

This is a **full-stack app**: a frontend (`public/index.html`) plus a small Node/Express backend (`server.js`) that keeps your Google Gemini API key safely on the server and never exposes it to the browser.

geniED chat, the Quiz Generator, and the Note Summarizer all call real AI (Gemini 2.5 Flash) through this backend's `/api/chat` route.

**Why Gemini?** Google AI Studio gives a genuinely free API tier — no credit card, no expiration — which makes it a great fit for a student project like this.

## 1. Install Node.js (if you don't have it)

You need Node.js v18 or higher. Check with:
```
node -v
```
If it's not installed, get it from https://nodejs.org.

## 2. Install dependencies

Inside this folder (`edugenie-app`), open a terminal and run:
```
npm install
```

## 3. Set your API key

1. Copy `.env.example` to a new file named `.env`:
   ```
   cp .env.example .env
   ```
   (On Windows: copy `.env.example`, paste it, and rename the copy to `.env`)

2. Open `.env` and add your free Gemini API key:
   ```
   GEMINI_API_KEY=AIzaSy...
   ```
   Get a free key at: https://aistudio.google.com/apikey
   (Just sign in with any Google account — no credit card, no trial period, no expiration.)

   ⚠️ Never commit your `.env` file to a public GitHub repo — it contains your secret key.

## 4. Start the server

```
npm start
```

You should see:
```
🚀 EduGenie is running: http://localhost:3000
```

## 5. Open the app

Go to `http://localhost:3000` in your browser — the full EduGenie app (landing page, sign-in, geniED, quizzes, notes, everything) runs from here, and geniED, the quiz generator, and the note summarizer will now respond with **real AI**.

---

## How it works (short version)

- The browser (`public/index.html`) never calls Gemini directly.
- The browser only calls your own server's `/api/chat` route.
- `server.js` takes that request, attaches your secret `GEMINI_API_KEY`, forwards it to Google's Gemini API, and sends the response back to the browser.
- This means your API key is never visible or stealable from anyone's browser.

## Deploying it for real (Render.com — free)

⚠️ **GitHub Pages cannot run this file** — GitHub Pages only serves static HTML/CSS/JS, it cannot run a Node.js backend (`server.js`). Use Render.com (or Railway/Fly.io) instead.

**Steps to deploy on Render.com:**

1. Upload this whole folder (`edugenie-app`) to a GitHub repo — keep `server.js`, `package.json`, and the `public/` folder in the **root**, not inside any extra subfolder or zip.
2. Sign up at https://render.com using GitHub.
3. In the dashboard, click **"New +" → "Web Service"** → select your repo.
4. Settings:
   - Runtime: **Node**
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Instance Type: **Free**
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY` = your free Gemini key
   - `RATE_LIMIT_MAX` = `40` (optional)
   - `RATE_LIMIT_WINDOW_MS` = `18000000` (optional, 5 hours)
6. Click **"Create Web Service"** — in 2-3 minutes you'll get a live URL like `https://edugenie.onrender.com`

## Still simulated/demo pieces

- **Google Sign-In and email OTP** are still UI-level simulations (the verification code shows up in an in-app toast instead of a real email) — because real Google OAuth requires registering an app in Google Cloud Console, and real email delivery needs an email service (like Resend or SendGrid). Happy to wire these up for real if you want — just ask.
- The sample notes/quizzes shown on the dashboard at first are just demo data, not a bug.
