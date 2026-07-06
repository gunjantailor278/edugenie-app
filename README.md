 # EduGenie — Setup Guide

This is now a **full-stack** app: frontend (`public/index.html`) + a small Node/Express backend (`server.js`) that keeps your Anthropic API key safely on the server side and never exposes it to the browser.

geniED chat, Quiz Generator, and Note Summarizer — all three call real AI (Claude Sonnet 5) through the backend's `/api/chat` route.

## 1. Install Node.js (if you don't have it)

You need Node.js v18 or higher. Check with:

```
node -v
```

If it's not installed, get it from <https://nodejs.org>.

## 2. Install dependencies

Open a terminal inside this folder (`edugenie-app`) and run:

```
npm install
```

## 3. Set up your API key

1. Copy the `.env.example` file and rename it to `.env`:

   ```
   cp .env.example .env
   ```

   (On Windows: copy-paste `.env.example` and rename the copy to `.env`)

2. Open the `.env` file and add your real Anthropic API key:

   ```
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
   ```

   You can get a key from <https://console.anthropic.com/settings/keys> (if you don't have an account, sign up at console.anthropic.com first — new accounts get some free credits).

   ⚠️ Never push the `.env` file to a public GitHub repo — it contains your secret key.

## 4. Run the server

```
npm start
```

You should see this in the terminal:

```
🚀 EduGenie is running: http://localhost:3000
```

## 5. Open the app

Open `http://localhost:3000` in your browser — the entire EduGenie app (landing page, sign-in, geniED, quiz, notes, everything) runs from here, and now geniED, the quiz generator, and the note summarizer all respond with **real AI**.

---

## How it works (in short)

- The browser (`public/index.html`) never calls Anthropic directly.
- The browser only calls its own server's `/api/chat` route.
- `server.js` takes that request, attaches your secret `ANTHROPIC_API_KEY`, forwards it to Anthropic, and sends the response back to the browser.
- This means your API key can never be seen or stolen from any user's browser.

## Deploying to production (Render.com — free)

⚠️ **GitHub Pages CANNOT run this** — GitHub Pages only serves static HTML/CSS/JS, it can't run a Node.js backend (`server.js`). So use Render.com (or Railway/Fly.io) instead.

**Steps to deploy on Render.com:**

1. Upload this entire folder (`edugenie-app`) to a GitHub repo — keep `server.js`, `package.json`, and the `public/` folder **at the root**, not inside a zip or subfolder.
2. Sign up at <https://render.com> using GitHub.
3. In the dashboard, click **"New +" → "Web Service"** → select your repo.
4. Settings:
   - Runtime: **Node**
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Instance Type: **Free**
5. In the **Environment Variables** section, add:
   - `ANTHROPIC_API_KEY` = your real key
   - `RATE_LIMIT_MAX` = `40` (optional)
   - `RATE_LIMIT_WINDOW_MS` = `18000000` (optional, 5 hours)
6. Click **"Create Web Service"** — you'll get a live URL in 2-3 minutes, like `https://edugenie.onrender.com`

## Still demo/simulated features

- **Google Sign-In and Email OTP** are still UI-level simulations (the verification code shows up in a toast, no real email is sent) — because real Google OAuth requires registering the app on Google Cloud Console, and sending real emails requires an email service (like Resend or SendGrid). If you want, these can be added too — just ask.
- The sample notes/quizzes shown initially on the dashboard are just demo data, not a bug.
