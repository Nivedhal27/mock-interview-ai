import { useState, useEffect, useRef, useCallback } from "react";

// ── palette & design tokens ──────────────────────────────────────────────────
const C = {
  bg: "#0a0a0f",
  surface: "#12121a",
  card: "#1a1a26",
  border: "#2a2a3d",
  borderHover: "#3d3d58",
  accent: "#6c63ff",
  accentDim: "#6c63ff22",
  accentHover: "#7d75ff",
  green: "#22c98e",
  greenDim: "#22c98e18",
  amber: "#f59e0b",
  amberDim: "#f59e0b18",
  red: "#ef4444",
  redDim: "#ef444418",
  textPrimary: "#e8e8f0",
  textSecondary: "#8888a8",
  textMuted: "#4a4a6a",
};

const topics = [
  { id: "dsa", label: "Data Structures & Algorithms", icon: "⚡", color: C.accent, desc: "Arrays, trees, graphs, DP" },
  { id: "hr", label: "HR & Behavioural", icon: "💬", color: C.green, desc: "STAR method, soft skills" },
  { id: "system", label: "System Design", icon: "🏗️", color: C.amber, desc: "Scalability, architecture" },
  { id: "corecs", label: "Core CS", icon: "🖥️", color: "#e879f9", desc: "OS, DBMS, Networks, OOP" },
  { id: "aptitude", label: "Aptitude & Reasoning", icon: "🧩", color: "#38bdf8", desc: "Quant, logical, verbal" },
];

const difficultyLevels = ["Easy", "Medium", "Hard"];

// ── styles ────────────────────────────────────────────────────────────────────
const gStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}
  body{background:${C.bg};color:${C.textPrimary};font-family:'DM Sans',sans-serif;min-height:100vh}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  .fade-up{animation:fadeUp 0.35s ease forwards}
  .btn{cursor:pointer;border:none;outline:none;font-family:'DM Sans',sans-serif;transition:all 0.18s ease}
  .btn:active{transform:scale(0.97)}
  input,textarea{font-family:'DM Sans',sans-serif;outline:none;border:none}
`;

// ── small reusable components ─────────────────────────────────────────────────
function Spinner({ size = 18, color = C.accent }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `2px solid ${color}33`,
      borderTopColor: color,
      animation: "spin 0.7s linear infinite",
      display: "inline-block",
    }} />
  );
}

function ScoreBadge({ score }) {
  const color = score >= 8 ? C.green : score >= 5 ? C.amber : C.red;
  const bg = score >= 8 ? C.greenDim : score >= 5 ? C.amberDim : C.redDim;
  return (
    <span style={{
      background: bg, color, border: `1px solid ${color}44`,
      borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 500,
    }}>
      {score}/10
    </span>
  );
}

function Tag({ label, color }) {
  return (
    <span style={{
      background: color + "18", color, border: `1px solid ${color}33`,
      borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 500,
    }}>{label}</span>
  );
}

// ── API helper ────────────────────────────────────────────────────────────────
async function callClaude(messages, system) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      max_tokens: 1000,
      messages: [
        { role: "system", content: system },
        ...messages,
      ],
    }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

// ── Home screen ───────────────────────────────────────────────────────────────
function HomeScreen({ onStart, sessions }) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [difficulty, setDifficulty] = useState("Medium");

  const totalSessions = sessions.length;
  const avgScore = sessions.length
    ? Math.round(sessions.flatMap(s => s.qas).reduce((a, q) => a + (q.score || 0), 0) /
        Math.max(1, sessions.flatMap(s => s.qas).filter(q => q.score).length) * 10) / 10
    : null;

  return (
    <div style={{ minHeight: "100vh", padding: "0 0 80px" }}>
      {/* header */}
      <div style={{
        background: `linear-gradient(180deg, ${C.surface} 0%, transparent 100%)`,
        padding: "32px 20px 24px", borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
              <span style={{ color: C.accent }}>inter</span>view.ai
            </div>
            <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>placement prep · powered by Claude</div>
          </div>
          {totalSessions > 0 && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: C.accent }}>{avgScore || "—"}</div>
              <div style={{ fontSize: 11, color: C.textSecondary }}>avg score</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        {/* stats row */}
        {totalSessions > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }} className="fade-up">
            {[
              { label: "Sessions", val: totalSessions },
              { label: "Questions", val: sessions.flatMap(s => s.qas).length },
              { label: "Best score", val: Math.max(...sessions.flatMap(s => s.qas).map(q => q.score || 0)) + "/10" },
            ].map(s => (
              <div key={s.label} style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                padding: "12px 10px", textAlign: "center",
              }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: C.textPrimary }}>{s.val}</div>
                <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* topic selector */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, letterSpacing: 1.5, marginBottom: 12, textTransform: "uppercase" }}>
            Choose topic
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {topics.map((t, i) => (
              <button key={t.id} className="btn fade-up" style={{
                animationDelay: `${i * 0.06}s`,
                background: selectedTopic?.id === t.id ? t.color + "18" : C.card,
                border: `1px solid ${selectedTopic?.id === t.id ? t.color + "66" : C.border}`,
                borderRadius: 14, padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 14,
                textAlign: "left", cursor: "pointer",
                transform: selectedTopic?.id === t.id ? "scale(1.01)" : "scale(1)",
              }} onClick={() => setSelectedTopic(t)}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: t.color + "22", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 20, flexShrink: 0,
                }}>{t.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>{t.desc}</div>
                </div>
                {selectedTopic?.id === t.id && (
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff" }}>✓</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* difficulty */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, letterSpacing: 1.5, marginBottom: 12, textTransform: "uppercase" }}>
            Difficulty
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {difficultyLevels.map(d => {
              const col = d === "Easy" ? C.green : d === "Medium" ? C.amber : C.red;
              const sel = difficulty === d;
              return (
                <button key={d} className="btn" style={{
                  flex: 1, padding: "10px 0", borderRadius: 10,
                  background: sel ? col + "22" : C.card,
                  border: `1px solid ${sel ? col + "66" : C.border}`,
                  color: sel ? col : C.textSecondary,
                  fontSize: 13, fontWeight: sel ? 600 : 400,
                }} onClick={() => setDifficulty(d)}>{d}</button>
              );
            })}
          </div>
        </div>

        {/* start button */}
        <button className="btn" style={{
          width: "100%", padding: "16px",
          background: selectedTopic ? C.accent : C.border,
          borderRadius: 14, color: "#fff",
          fontSize: 16, fontWeight: 600,
          fontFamily: "'Syne',sans-serif",
          letterSpacing: 0.3,
          opacity: selectedTopic ? 1 : 0.5,
          cursor: selectedTopic ? "pointer" : "not-allowed",
          boxShadow: selectedTopic ? `0 8px 32px ${C.accent}44` : "none",
        }} onClick={() => selectedTopic && onStart(selectedTopic, difficulty)}>
          {selectedTopic ? `Start ${selectedTopic.label} Interview →` : "Select a topic to begin"}
        </button>
      </div>
    </div>
  );
}

// ── Interview screen ──────────────────────────────────────────────────────────
function InterviewScreen({ topic, difficulty, onEnd }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("intro"); // intro | interviewing | finished
  const [qas, setQas] = useState([]);
  const [currentQ, setCurrentQ] = useState(null);
  const [qCount, setQCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [qTimer, setQTimer] = useState(0);
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const qTimerRef = useRef(null);

  const MAX_Q = 5;

  const sysPrompt = `You are a sharp, professional technical interviewer at a top tech company. 
You are conducting a ${difficulty} level interview on the topic: ${topic.label}.
Rules:
- Ask ONE focused question at a time. Keep questions concise and clear.
- After receiving an answer, respond in this EXACT JSON format (no markdown, just JSON):
{
  "feedback": "2-3 sentence feedback on the answer",
  "score": <integer 1-10>,
  "improvement": "one specific improvement tip",
  "nextQuestion": "your next interview question OR null if this was question ${MAX_Q}"
}
- For the FIRST message only, just ask the first question as plain text (no JSON).
- Be encouraging but honest. Don't be harsh.
- Match difficulty: ${difficulty === "Easy" ? "basic conceptual questions" : difficulty === "Medium" ? "medium-depth questions with examples" : "deep questions, edge cases, trade-offs"}.`;

  // session timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // question timer
  useEffect(() => {
    if (phase === "interviewing") {
      setQTimer(0);
      qTimerRef.current = setInterval(() => setQTimer(t => t + 1), 1000);
      return () => clearInterval(qTimerRef.current);
    }
  }, [qCount, phase]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  // start interview
  useEffect(() => {
    startInterview();
  }, []);

  async function startInterview() {
    setLoading(true);
    try {
      const text = await callClaude([{ role: "user", content: `Start the interview. Ask your first question.` }], sysPrompt);
      setCurrentQ(text.trim());
      setMessages([{ role: "ai", content: text.trim(), type: "question", qNum: 1 }]);
      setQCount(1);
      setPhase("interviewing");
    } catch (e) {
      setMessages([{ role: "ai", content: "⚠️ Could not connect to AI. Check your API key.", type: "error" }]);
    }
    setLoading(false);
  }

  async function submitAnswer() {
    const ans = input.trim();
    if (!ans || loading) return;
    setInput("");
    const userMsg = { role: "user", content: ans, type: "answer", time: qTimer };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const history = messages.map(m => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.content,
    }));

    try {
      const raw = await callClaude([...history, { role: "user", content: ans }], sysPrompt);
      let parsed;
      try {
        const jsonStr = raw.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(jsonStr);
      } catch {
        parsed = { feedback: raw, score: 6, improvement: "", nextQuestion: null };
      }

      const newQa = {
        question: currentQ,
        answer: ans,
        feedback: parsed.feedback,
        score: parsed.score,
        improvement: parsed.improvement,
        time: qTimer,
        topic: topic.id,
      };
      setQas(prev => [...prev, newQa]);

      const feedbackMsg = {
        role: "ai", type: "feedback", content: parsed.feedback,
        score: parsed.score, improvement: parsed.improvement,
      };
      setMessages(prev => [...prev, feedbackMsg]);

      if (parsed.nextQuestion && qCount < MAX_Q) {
        setTimeout(() => {
          setCurrentQ(parsed.nextQuestion);
          setMessages(prev => [...prev, { role: "ai", content: parsed.nextQuestion, type: "question", qNum: qCount + 1 }]);
          setQCount(q => q + 1);
          setLoading(false);
        }, 600);
      } else {
        setPhase("finished");
        setLoading(false);
        clearInterval(timerRef.current);
        clearInterval(qTimerRef.current);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: "ai", content: "⚠️ Error getting feedback. Please try again.", type: "error" }]);
      setLoading(false);
    }
  }

  const fmt = s => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const avgScore = qas.length ? (qas.reduce((a, q) => a + q.score, 0) / qas.length).toFixed(1) : null;

  if (phase === "finished") {
    return <ResultScreen qas={qas} topic={topic} elapsed={elapsed} difficulty={difficulty} onEnd={onEnd} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg }}>
      {/* top bar */}
      <div style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
      }}>
        <button className="btn" style={{ background: "none", color: C.textSecondary, fontSize: 18, padding: "0 4px" }} onClick={() => onEnd(null)}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{topic.icon} {topic.label}</div>
          <div style={{ fontSize: 11, color: C.textSecondary }}>
            <Tag label={difficulty} color={difficulty === "Easy" ? C.green : difficulty === "Medium" ? C.amber : C.red} />
            <span style={{ marginLeft: 8 }}>Q {qCount}/{MAX_Q}</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.accent, fontFamily: "'Syne',sans-serif" }}>{fmt(elapsed)}</div>
          {avgScore && <div style={{ fontSize: 11, color: C.textSecondary }}>avg {avgScore}/10</div>}
        </div>
      </div>

      {/* progress bar */}
      <div style={{ height: 2, background: C.border, flexShrink: 0 }}>
        <div style={{ height: "100%", width: `${(qCount / MAX_Q) * 100}%`, background: topic.color, transition: "width 0.4s ease" }} />
      </div>

      {/* chat area */}
      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
        {messages.map((msg, i) => (
          <div key={i} className="fade-up" style={{ marginBottom: 14, animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}>
            {msg.type === "question" && (
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, background: topic.color + "22",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0,
                }}>{topic.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 6 }}>
                    Interviewer · Q{msg.qNum}
                  </div>
                  <div style={{
                    background: C.card, border: `1px solid ${C.border}`,
                    borderRadius: "4px 14px 14px 14px", padding: "12px 14px",
                    fontSize: 14, lineHeight: 1.6, color: C.textPrimary,
                  }}>{msg.content}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>⏱ {fmt(qTimer)}</div>
                </div>
              </div>
            )}
            {msg.type === "answer" && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ maxWidth: "82%" }}>
                  <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 6, textAlign: "right" }}>
                    You · {fmt(msg.time || 0)}
                  </div>
                  <div style={{
                    background: C.accent + "22", border: `1px solid ${C.accent}33`,
                    borderRadius: "14px 4px 14px 14px", padding: "12px 14px",
                    fontSize: 14, lineHeight: 1.6, color: C.textPrimary,
                  }}>{msg.content}</div>
                </div>
              </div>
            )}
            {msg.type === "feedback" && (
              <div style={{ margin: "4px 0 4px 42px" }}>
                <div style={{
                  background: msg.score >= 8 ? C.greenDim : msg.score >= 5 ? C.amberDim : C.redDim,
                  border: `1px solid ${(msg.score >= 8 ? C.green : msg.score >= 5 ? C.amber : C.red) + "33"}`,
                  borderRadius: 12, padding: "10px 12px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary }}>AI FEEDBACK</span>
                    <ScoreBadge score={msg.score} />
                  </div>
                  <div style={{ fontSize: 13, color: C.textPrimary, lineHeight: 1.6, marginBottom: msg.improvement ? 8 : 0 }}>
                    {msg.feedback}
                  </div>
                  {msg.improvement && (
                    <div style={{ fontSize: 12, color: C.amber, borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 2 }}>
                      💡 {msg.improvement}
                    </div>
                  )}
                </div>
              </div>
            )}
            {msg.type === "error" && (
              <div style={{ background: C.redDim, border: `1px solid ${C.red}33`, borderRadius: 12, padding: "10px 14px", fontSize: 13, color: C.red }}>
                {msg.content}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: topic.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{topic.icon}</div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "4px 14px 14px 14px", padding: "12px 16px", display: "flex", gap: 6, alignItems: "center" }}>
              {[0, 0.15, 0.3].map((d, i) => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent, animation: `pulse 1.2s ${d}s ease infinite` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* input area */}
      <div style={{ background: C.surface, borderTop: `1px solid ${C.border}`, padding: "12px 16px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitAnswer(); } }}
            placeholder={phase === "interviewing" && !loading ? "Type your answer... (Enter to send)" : "Waiting..."}
            disabled={loading || phase !== "interviewing"}
            rows={3}
            style={{
              flex: 1, background: C.card, border: `1px solid ${input ? C.accent + "66" : C.border}`,
              borderRadius: 12, padding: "10px 14px", color: C.textPrimary,
              fontSize: 14, lineHeight: 1.5, resize: "none",
              transition: "border 0.2s",
            }}
          />
          <button className="btn" onClick={submitAnswer} disabled={!input.trim() || loading}
            style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: input.trim() && !loading ? C.accent : C.border,
              color: "#fff", fontSize: 18,
              boxShadow: input.trim() && !loading ? `0 4px 20px ${C.accent}44` : "none",
            }}>
            {loading ? <Spinner size={16} color="#fff" /> : "↑"}
          </button>
        </div>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6, textAlign: "center" }}>
          Shift+Enter for new line · {MAX_Q - qCount} questions remaining
        </div>
      </div>
    </div>
  );
}

// ── Result screen ─────────────────────────────────────────────────────────────
function ResultScreen({ qas, topic, elapsed, difficulty, onEnd }) {
  const avg = qas.length ? (qas.reduce((a, q) => a + q.score, 0) / qas.length) : 0;
  const avgRound = Math.round(avg * 10) / 10;
  const grade = avg >= 8 ? { label: "Excellent", color: C.green } : avg >= 6 ? { label: "Good", color: C.accent } : avg >= 4 ? { label: "Average", color: C.amber } : { label: "Needs Work", color: C.red };
  const fmt = s => `${Math.floor(s / 60)}m ${s % 60}s`;
  const avgTime = Math.round(qas.reduce((a, q) => a + (q.time || 0), 0) / qas.length);

  return (
    <div style={{ minHeight: "100vh", padding: "0 0 80px", overflowY: "auto" }}>
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "20px 16px 24px" }}>
        <button className="btn" style={{ background: "none", color: C.textSecondary, fontSize: 18, marginBottom: 16 }} onClick={() => onEnd(null)}>← Home</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: C.textSecondary, textTransform: "uppercase", marginBottom: 12 }}>Interview complete</div>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: grade.color + "22", border: `3px solid ${grade.color}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
            fontSize: 28, fontFamily: "'Syne',sans-serif", fontWeight: 800, color: grade.color,
          }}>{avgRound}</div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Syne',sans-serif", color: grade.color }}>{grade.label}</div>
          <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 4 }}>{topic.icon} {topic.label} · {difficulty}</div>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {/* stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Avg score", val: avgRound + "/10", color: grade.color },
            { label: "Time taken", val: fmt(elapsed), color: C.textPrimary },
            { label: "Avg response", val: fmt(avgTime), color: C.textPrimary },
            { label: "Questions", val: qas.length + "/5", color: C.textPrimary },
          ].map(s => (
            <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 14px" }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* score bar */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, marginBottom: 12 }}>SCORE PER QUESTION</div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 60 }}>
            {qas.map((q, i) => {
              const col = q.score >= 8 ? C.green : q.score >= 5 ? C.amber : C.red;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 10, color: col, fontWeight: 600 }}>{q.score}</div>
                  <div style={{ width: "100%", borderRadius: 4, background: col + "33", height: Math.max(8, (q.score / 10) * 40), transition: "height 0.5s ease" }}>
                    <div style={{ width: "100%", borderRadius: 4, background: col, height: "100%", opacity: 0.85 }} />
                  </div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>Q{i + 1}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Q&A review */}
        <div style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, letterSpacing: 1.5, marginBottom: 12, textTransform: "uppercase" }}>Review</div>
        {qas.map((qa, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: C.textSecondary }}>Q{i + 1} · {fmt(qa.time || 0)}</span>
              <ScoreBadge score={qa.score} />
            </div>
            <div style={{ fontSize: 13, color: C.textPrimary, fontWeight: 500, marginBottom: 8, lineHeight: 1.5 }}>{qa.question}</div>
            <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6, marginBottom: 8, borderLeft: `2px solid ${C.border}`, paddingLeft: 10 }}>{qa.answer}</div>
            <div style={{ fontSize: 12, color: C.textPrimary, lineHeight: 1.5, marginBottom: qa.improvement ? 8 : 0 }}>{qa.feedback}</div>
            {qa.improvement && (
              <div style={{ fontSize: 12, color: C.amber, marginTop: 6 }}>💡 {qa.improvement}</div>
            )}
          </div>
        ))}

        <button className="btn" style={{
          width: "100%", padding: "14px", background: C.accent, borderRadius: 14,
          color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: "'Syne',sans-serif",
          marginTop: 8, boxShadow: `0 8px 32px ${C.accent}44`,
        }} onClick={() => onEnd({ qas, topic, elapsed, difficulty, date: new Date().toISOString() })}>
          Save & Return Home ✓
        </button>
      </div>
    </div>
  );
}

// ── Dashboard screen ──────────────────────────────────────────────────────────
function DashboardScreen({ sessions }) {
  if (sessions.length === 0) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: C.textPrimary, marginBottom: 8 }}>No data yet</div>
      <div style={{ fontSize: 14, color: C.textSecondary }}>Complete your first interview to see your analytics here.</div>
    </div>
  );

  const allQas = sessions.flatMap(s => s.qas);
  const overallAvg = (allQas.reduce((a, q) => a + q.score, 0) / allQas.length).toFixed(1);

  const byTopic = topics.map(t => {
    const tQas = allQas.filter(q => q.topic === t.id);
    return {
      ...t,
      count: tQas.length,
      avg: tQas.length ? (tQas.reduce((a, q) => a + q.score, 0) / tQas.length).toFixed(1) : null,
    };
  }).filter(t => t.count > 0);

  const recentSessions = [...sessions].reverse().slice(0, 5);

  const strengths = byTopic.filter(t => parseFloat(t.avg) >= 7).map(t => t.label.split(" ")[0]);
  const toImprove = byTopic.filter(t => parseFloat(t.avg) < 6).map(t => t.label.split(" ")[0]);

  return (
    <div style={{ minHeight: "100vh", padding: "0 0 80px", overflowY: "auto" }}>
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "24px 16px" }}>
        <div style={{ fontSize: 20, fontFamily: "'Syne',sans-serif", fontWeight: 800 }}>Analytics</div>
        <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>{sessions.length} sessions · {allQas.length} questions answered</div>
      </div>

      <div style={{ padding: "16px" }}>
        {/* overall score */}
        <div style={{
          background: C.accent + "15", border: `1px solid ${C.accent}33`,
          borderRadius: 16, padding: "20px 16px", marginBottom: 16, textAlign: "center",
        }} className="fade-up">
          <div style={{ fontSize: 48, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: C.accent }}>{overallAvg}</div>
          <div style={{ fontSize: 13, color: C.textSecondary }}>Overall average score</div>
          {strengths.length > 0 && <div style={{ fontSize: 12, color: C.green, marginTop: 6 }}>✓ Strong: {strengths.join(", ")}</div>}
          {toImprove.length > 0 && <div style={{ fontSize: 12, color: C.amber, marginTop: 4 }}>↑ Improve: {toImprove.join(", ")}</div>}
        </div>

        {/* by topic */}
        <div style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, letterSpacing: 1.5, marginBottom: 12, textTransform: "uppercase" }}>By topic</div>
        <div style={{ marginBottom: 20 }}>
          {byTopic.map((t, i) => (
            <div key={t.id} className="fade-up" style={{ animationDelay: `${i * 0.07}s`, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 20 }}>{t.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{t.label.split(" ").slice(0, 2).join(" ")}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: parseFloat(t.avg) >= 7 ? C.green : parseFloat(t.avg) >= 5 ? C.amber : C.red }}>{t.avg}/10</span>
                  </div>
                  <div style={{ height: 4, background: C.border, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(parseFloat(t.avg) / 10) * 100}%`, background: t.color, borderRadius: 4, transition: "width 0.6s ease" }} />
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{t.count} questions</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* recent sessions */}
        <div style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, letterSpacing: 1.5, marginBottom: 12, textTransform: "uppercase" }}>Recent sessions</div>
        {recentSessions.map((s, i) => {
          const avg = (s.qas.reduce((a, q) => a + q.score, 0) / s.qas.length).toFixed(1);
          const col = parseFloat(avg) >= 7 ? C.green : parseFloat(avg) >= 5 ? C.amber : C.red;
          const t = topics.find(t => t.id === s.topic?.id) || s.topic;
          const date = new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
          return (
            <div key={i} style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ fontSize: 22 }}>{t?.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{t?.label}</div>
                <div style={{ fontSize: 11, color: C.textSecondary }}>{date} · {s.difficulty} · {s.qas.length} Qs</div>
              </div>
              <ScoreBadge score={parseFloat(avg)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── bottom nav ────────────────────────────────────────────────────────────────
function BottomNav({ tab, setTab, sessionCount }) {
  const items = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "dashboard", icon: "📊", label: "Analytics" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: C.surface, borderTop: `1px solid ${C.border}`,
      display: "flex", zIndex: 100,
      paddingBottom: "env(safe-area-inset-bottom, 0)",
    }}>
      {items.map(item => (
        <button key={item.id} className="btn" style={{
          flex: 1, padding: "10px 0", background: "none",
          color: tab === item.id ? C.accent : C.textSecondary,
          fontSize: 10, fontWeight: 500, display: "flex", flexDirection: "column",
          alignItems: "center", gap: 3,
        }} onClick={() => setTab(item.id)}>
          <div style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</div>
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ── root app ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const [screen, setScreen] = useState("home"); // home | interview
  const [interviewConfig, setInterviewConfig] = useState(null);
  const [sessions, setSessions] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mock_iv_sessions") || "[]"); } catch { return []; }
  });

  const saveSessions = useCallback((newSessions) => {
    setSessions(newSessions);
    try { localStorage.setItem("mock_iv_sessions", JSON.stringify(newSessions)); } catch {}
  }, []);

  function handleStart(topic, difficulty) {
    setInterviewConfig({ topic, difficulty });
    setScreen("interview");
  }

  function handleEnd(result) {
    if (result) {
      saveSessions([...sessions, result]);
      setTab("dashboard");
    }
    setScreen("home");
    setInterviewConfig(null);
  }

  if (screen === "interview" && interviewConfig) {
    return (
      <>
        <style>{gStyles}</style>
        <InterviewScreen
          topic={interviewConfig.topic}
          difficulty={interviewConfig.difficulty}
          onEnd={handleEnd}
        />
      </>
    );
  }

  return (
    <>
      <style>{gStyles}</style>
      <div style={{ paddingBottom: 64 }}>
        {tab === "home" && <HomeScreen onStart={handleStart} sessions={sessions} />}
        {tab === "dashboard" && <DashboardScreen sessions={sessions} />}
      </div>
      <BottomNav tab={tab} setTab={setTab} sessionCount={sessions.length} />
    </>
  );
}
