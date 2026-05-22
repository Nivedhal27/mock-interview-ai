# 🎯 InterviewAI — AI-Powered Mock Interview App

> A smart placement preparation app that simulates real interviews using AI, gives instant feedback, and tracks your performance over time.

---

## 📱 Live Demo

🔗 **[Try it here → mock-interview-ai.vercel.app](https://mock-interview-ai.vercel.app)**

> Works on mobile too — open in Chrome and tap "Add to Home Screen" to install it like a real app!

---

## 🖼️ Screenshots

| Home Screen | Interview Screen | Results | Analytics |
|---|---|---|---|
| Pick topic & difficulty | Chat with AI interviewer | Score + feedback | Track progress |

---

## ✨ Features

- 🤖 **AI Interviewer** — Powered by LLaMA 3 via Groq API. Asks real interview questions tailored to your topic and difficulty
- 💬 **Chat-style UI** — Natural conversation flow, just like a real interview
- ⚡ **Instant Feedback** — After every answer you get a score (1–10), detailed feedback, and one improvement tip
- 📊 **Performance Dashboard** — Track your average score, strongest topics, and full session history
- 🎯 **5 Interview Topics** — DSA, HR & Behavioural, System Design, Core CS, Aptitude
- 🔥 **3 Difficulty Levels** — Easy, Medium, Hard
- ⏱️ **Answer Timer** — Tracks how long you take per question
- 📱 **Mobile-ready** — Fully responsive, installable as a PWA

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | Frontend UI |
| Vite | Build tool |
| Groq API (LLaMA 3) | AI interview engine |
| CSS-in-JS | Styling |
| LocalStorage | Session persistence |
| Web PWA | Mobile installability |

---

## 🚀 Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/mock-interview-ai.git
cd mock-interview-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variable
Create a `.env` file in the root folder:
```
VITE_GROQ_KEY=your_groq_api_key_here
```
Get your free API key at [console.groq.com](https://console.groq.com)

### 4. Start the app
```bash
npm run dev
```

Open `http://localhost:5173` in your browser ✅

---

## 📂 Project Structure

```
mock-interview-app/
├── public/
│   └── manifest.json        # PWA config
├── src/
│   ├── App.jsx              # Main app (all screens)
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── vite.config.js           # Vite config
└── README.md
```

---

## 🎮 How to Use

1. **Open the app** on your phone or browser
2. **Select a topic** — DSA, HR, System Design, Core CS, or Aptitude
3. **Choose difficulty** — Easy, Medium, or Hard
4. **Start the interview** — AI asks you 5 questions one by one
5. **Type your answers** — Get instant AI feedback and score after each answer
6. **See your results** — Review all questions, answers, feedback and your overall grade
7. **Check analytics** — Track improvement across sessions on the dashboard

---

## 🌐 Deploy Your Own

### Deploy to Vercel (free)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **New Project** → select this repo
4. Add environment variable:
   - `VITE_GROQ_KEY` = your Groq API key
5. Click **Deploy** — live in 2 minutes ✅

---

## 🔮 Future Improvements

- [ ] Voice input and text-to-speech
- [ ] User authentication with Firebase
- [ ] Company-specific interview modes (Google, Amazon, etc.)
- [ ] Resume upload and personalised questions
- [ ] Leaderboard to compete with friends
- [ ] Offline mode

---

## 👩‍💻 Author

**Nivedha L**

- LinkedIn: [Nivedha L ](https://linkedin.com/in/nivedhal2706)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

> Built with ❤️ for placement preparation. Star ⭐ this repo if it helped you!
