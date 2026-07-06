# EduGenie — Setup Guide (Hinglish)

Yeh ab ek **full-stack** app hai: frontend (`public/index.html`) + ek chota Node/Express backend (`server.js`) jo tumhari Anthropic API key ko safely server-side pe rakhta hai aur browser ko kabhi expose nahi karta.

geniED chat, Quiz Generator, aur Note Summarizer — teeno isi backend ke `/api/chat` route se real AI (Claude Sonnet 5) ko call karte hain.

## 1. Node.js install karo (agar nahi hai)

Node.js v18 ya usse upar chahiye. Check karo:
```
node -v
```
Agar nahi hai, https://nodejs.org se install karo.

## 2. Dependencies install karo

Is folder (`edugenie-app`) ke andar terminal khol ke:
```
npm install
```

## 3. Apni API key set karo

1. `.env.example` file ka naam copy karke `.env` banao:
   ```
   cp .env.example .env
   ```
   (Windows pe: `.env.example` ko copy-paste karke naam `.env` rakh do)

2. `.env` file kholo aur apni real Anthropic API key daalo:
   ```
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
   ```
   Key yahan se milegi: https://console.anthropic.com/settings/keys
   (Agar account nahi hai toh pehle console.anthropic.com pe signup karo — kuch free credits milte hain naye accounts ko.)

   ⚠️ `.env` file ko kabhi bhi GitHub pe public repo mein push mat karna — isme tumhari secret key hai.

## 4. Server chalao

```
npm start
```

Terminal mein yeh dikhega:
```
🚀 EduGenie is running: http://localhost:3000
```

## 5. App kholo

Browser mein `http://localhost:3000` kholo — poora EduGenie app (landing page, sign-in, geniED, quiz, notes, sab) yahin se chalega, aur ab geniED, quiz generator, aur note summarizer **real AI** se sahi javab denge.

---

## Kaise kaam karta hai (short mein)

- Browser (`public/index.html`) kabhi bhi Anthropic ko seedha call nahi karta.
- Browser sirf apne khud ke server ke `/api/chat` route ko call karta hai.
- `server.js` woh request leke, tumhari secret `ANTHROPIC_API_KEY` attach karke, Anthropic ko forward karta hai, aur response wapas browser ko bhej deta hai.
- Isse tumhari API key kabhi bhi kisi user ke browser mein dikhti/churayi nahi ja sakti.

## Real duniya mein deploy karna (Render.com — free)

⚠️ **GitHub Pages is file ko run NAHI kar sakta** — GitHub Pages sirf static HTML/CSS/JS serve karta hai, Node.js backend (`server.js`) nahi chala sakta. Isliye Render.com (ya Railway/Fly.io) use karo.

**Render.com pe deploy karne ke steps:**

1. Is poore folder (`edugenie-app`) ko GitHub repo mein upload karo — **root mein** `server.js`, `package.json`, aur `public/` folder rakhna, kisi zip/subfolder ke andar nahi.
2. https://render.com pe GitHub se sign up karo.
3. Dashboard mein **"New +" → "Web Service"** → apni repo select karo.
4. Settings:
   - Runtime: **Node**
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Instance Type: **Free**
5. **Environment Variables** section mein add karo:
   - `ANTHROPIC_API_KEY` = apni real key
   - `RATE_LIMIT_MAX` = `40` (optional)
   - `RATE_LIMIT_WINDOW_MS` = `18000000` (optional, 5 ghante)
6. **"Create Web Service"** — 2-3 min mein live URL milega jaise `https://edugenie.onrender.com`

## Abhi bhi demo/simulated cheezein

- **Google Sign-In aur Email OTP** abhi bhi UI-level simulation hain (verification code toast mein dikhta hai, real email nahi jaata) — kyunki real Google OAuth ke liye Google Cloud Console pe app register karni padti hai, aur real email bhejne ke liye ek email-service (jaise Resend, SendGrid) chahiye. Agar chaho toh yeh bhi add karwa sakte ho — bata dena.
- Dashboard ke shuruaati sample notes/quizzes sirf demo data hain, koi bug nahi hai.
