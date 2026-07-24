import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Send,
  Sparkle,
  User,
  Plus,
  Search,
  Trash2,
  Pencil,
  Check,
  X,
  BookOpen,
  Eye,
  ClipboardList,
  ArrowUpRight,
} from "lucide-react";
import { API_BASE, getSession } from "../api";
import BackButton from "../components/BackButton";
import { courses } from "../data/courses";
import { visualisations } from "../data/visualisations";
import { quizzes } from "../data/quizzes";
import { logActivity } from "../utils/lmsStorage";

const BLUE = "#1A56DB";
const BLUE_SOFT = "#EBF5FF";
const INK = "#191c1d";
const SUB = "#434654";
const BORDER = "#e5e7eb";
const PAGE_BG = "#f8f9fa";
const GREEN = "#16a34a";

const RAG_API_BASE = `${API_BASE}/rag`;
const STORAGE_PREFIX = "fhamia-tutor-conversations";

function storageKey(session) {
  return session?.id ? `${STORAGE_PREFIX}-${session.id}` : `${STORAGE_PREFIX}-guest`;
}

const suggestedNextByCourse = {
  linux: ["Quelle est la différence entre chmod et chown ?", "Explique la commande 'sudo' en détail."],
  reseaux: ["Quelle est la différence entre TCP et UDP ?", "Comment fonctionne une requête DNS ?"],
  bdd: ["Quelle est la différence entre INNER JOIN et LEFT JOIN ?", "Explique la normalisation 2NF."],
  ia: ["Comment fonctionne la rétropropagation ?", "Qu'est-ce que le mécanisme d'attention ?"],
};

const timeNow = () =>
  new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

function welcomeMessage(session, course) {
  return {
    role: "ia",
    time: timeNow(),
    text: `Bonjour ! Je suis votre tuteur FhamIA${session ? `, ${session.prenom}` : ""}. Posez-moi une question sur ${course ? course.title : "vos cours"} en français ou en darija.`,
  };
}

function loadConversations(session) {
  try {
    const raw = localStorage.getItem(storageKey(session));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveConversations(session, list) {
  localStorage.setItem(storageKey(session), JSON.stringify(list));
}

function makeConversation(session, courseId) {
  const course = courses.find((c) => c.id === courseId) || courses[0];
  const now = Date.now();
  return {
    id: `conv-${now}`,
    title: "Nouvelle conversation",
    courseId: course.id,
    createdAt: now,
    updatedAt: now,
    messages: [welcomeMessage(session, course)],
  };
}

function dateGroup(ts) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, today)) return "Aujourd'hui";
  if (sameDay(d, yesterday)) return "Hier";
  return "Plus tôt";
}

export default function Tutor() {
  const session = getSession();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState(() => {
    const existing = loadConversations(session);
    if (existing.length > 0) return existing;
    return [makeConversation(session, "linux")];
  });
  const [activeId, setActiveId] = useState(() => conversations[0]?.id);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollContainerRef = useRef(null);
  const stickToBottomRef = useRef(true);

  const sessionId = session?.id ?? null;

  // Recharge les conversations propres à l'utilisateur si la session change
  // (changement de compte sans rechargement complet de la page).
  useEffect(() => {
    const existing = loadConversations(session);
    const list = existing.length > 0 ? existing : [makeConversation(session, "linux")];
    setConversations(list);
    setActiveId(list[0]?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    saveConversations(session, conversations);
  }, [conversations, sessionId]);

  // Migre une seule fois l'ancienne clé globale (partagée entre tous les
  // comptes, issue d'une version précédente) vers la clé du compte qui la
  // consulte en premier, au lieu de la supprimer et perdre l'historique.
  useEffect(() => {
    const legacyRaw = localStorage.getItem(STORAGE_PREFIX);
    if (!legacyRaw) return;
    const myKey = storageKey(session);
    if (!localStorage.getItem(myKey)) {
      localStorage.setItem(myKey, legacyRaw);
      try {
        const parsed = JSON.parse(legacyRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
          setActiveId(parsed[0]?.id);
        }
      } catch {
        /* ignore malformed legacy data */
      }
    }
    localStorage.removeItem(STORAGE_PREFIX);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const active = conversations.find((c) => c.id === activeId) || conversations[0];
  const activeCourse = courses.find((c) => c.id === active?.courseId) || courses[0];

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el && stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [active?.messages, loading]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 80;
  };

  const updateActive = (updater) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...updater(c), updatedAt: Date.now() } : c))
    );
  };

  const createConversation = (courseId) => {
    const conv = makeConversation(session, courseId || activeCourse.id);
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setError("");
  };

  const deleteConversation = (id) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (next.length === 0) {
        const fresh = makeConversation(session, "linux");
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };

  const startRename = (conv) => {
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const confirmRename = () => {
    setConversations((prev) =>
      prev.map((c) => (c.id === editingId ? { ...c, title: editingTitle.trim() || c.title } : c))
    );
    setEditingId(null);
  };

  const sendQuestion = async (question) => {
    if (!question || loading || !active) return;

    stickToBottomRef.current = true;

    const history = active.messages
      .slice(-6)
      .map((m) => ({ role: m.role, text: m.text }));

    const isFirstUserMessage = !active.messages.some((m) => m.role === "user");
    if (isFirstUserMessage) {
      logActivity(session, { type: "tuteur", title: "Conversation avec le tuteur IA", description: question.slice(0, 80) });
    }

    updateActive((c) => ({
      ...c,
      title: isFirstUserMessage ? question.slice(0, 42) + (question.length > 42 ? "…" : "") : c.title,
      messages: [...c.messages, { role: "user", text: question, time: timeNow() }],
    }));
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${RAG_API_BASE}/query-stream/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur inconnue");
      }

      const sourcesHeader = res.headers.get("X-Sources") || "";
      const sources = sourcesHeader ? sourcesHeader.split(",").filter(Boolean) : [];

      setLoading(false);
      updateActive((c) => ({ ...c, messages: [...c.messages, { role: "ia", text: "", sources, time: timeNow() }] }));

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        const snapshot = text;
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== activeId) return c;
            const msgs = [...c.messages];
            msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], text: snapshot };
            return { ...c, messages: msgs };
          })
        );
      }
    } catch (err) {
      setError(
        "Impossible de contacter le tuteur IA. Vérifie que le serveur Django et Ollama sont bien démarrés. Détail : " + err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendQuestion(input.trim());
  };

  const initials = session ? `${session.prenom?.[0] || ""}${session.nom?.[0] || ""}` : "?";
  const questionCount = active ? active.messages.filter((m) => m.role === "user").length : 0;
  const totalQuestions = conversations.reduce(
    (sum, c) => sum + c.messages.filter((m) => m.role === "user").length,
    0
  );
  const learningHours = (conversations.length * 0.4 + totalQuestions * 0.08).toFixed(1);

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? conversations.filter((c) => c.title.toLowerCase().includes(q)) : conversations;
    return [...list].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [conversations, search]);

  const grouped = useMemo(() => {
    const groups = {};
    for (const c of filteredConversations) {
      const key = dateGroup(c.updatedAt);
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    }
    return groups;
  }, [filteredConversations]);

  const suggestions = suggestedNextByCourse[activeCourse.id] || [];
  const viz = visualisations[activeCourse.id] || [];
  const quiz = quizzes[activeCourse.id];

  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit", display: "flex", flexDirection: "column" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderBottom: `1px solid ${BORDER}`, background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <BackButton to="/dashboard" />
          <span style={{ fontSize: 20, fontWeight: 700, color: BLUE }}>FhamIA</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 600, color: SUB }}>
          <span style={{ padding: "3px 9px", borderRadius: 999, background: BLUE_SOFT, color: BLUE }}>
            {session ? "Pro Learner Plan" : "Invité"}
          </span>
          <Link to="/profile" style={{ width: 34, height: 34, borderRadius: "50%", background: BLUE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
            {initials}
          </Link>
        </div>
      </nav>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* ---------- Left sidebar: conversation history ---------- */}
        <aside style={{ width: 260, flexShrink: 0, borderRight: `1px solid ${BORDER}`, background: "#fff", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12, borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkle size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>FhamIA</div>
                <div style={{ fontSize: 10.5, color: SUB }}>AI TUTOR</div>
              </div>
            </div>

            <button
              onClick={() => createConversation(activeCourse.id)}
              className="landing-cta-primary"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer" }}
            >
              <Plus size={16} /> New Conversation
            </button>

            <div style={{ position: "relative" }}>
              <Search size={14} color={SUB} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search history..."
                style={{ width: "100%", background: PAGE_BG, border: `1px solid ${BORDER}`, borderRadius: 9, padding: "8px 10px 8px 30px", fontSize: 12.5, outline: "none", color: INK, boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "12px 10px" }}>
            {Object.keys(grouped).length === 0 && (
              <div style={{ fontSize: 12, color: SUB, padding: "10px 6px" }}>Aucune conversation trouvée.</div>
            )}
            {Object.entries(grouped).map(([label, list]) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, color: SUB, textTransform: "uppercase", padding: "4px 8px" }}>
                  {label}
                </div>
                {list.map((c) => {
                  const isActive = c.id === activeId;
                  const lastUser = [...c.messages].reverse().find((m) => m.role === "user");
                  return (
                    <div
                      key={c.id}
                      onClick={() => setActiveId(c.id)}
                      style={{
                        position: "relative",
                        cursor: "pointer",
                        padding: "9px 10px",
                        borderRadius: 10,
                        background: isActive ? BLUE_SOFT : "transparent",
                        marginBottom: 2,
                      }}
                      className={isActive ? "" : "icon-btn-hover"}
                    >
                      {editingId === c.id ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <input
                            autoFocus
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && confirmRename()}
                            onClick={(e) => e.stopPropagation()}
                            style={{ flex: 1, fontSize: 12.5, padding: "4px 6px", borderRadius: 6, border: `1px solid ${BORDER}`, outline: "none" }}
                          />
                          <Check size={14} color={GREEN} onClick={(e) => { e.stopPropagation(); confirmRename(); }} />
                          <X size={14} color={SUB} onClick={(e) => { e.stopPropagation(); setEditingId(null); }} />
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 40 }}>
                            {c.title}
                          </div>
                          <div style={{ fontSize: 10.5, color: SUB, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>
                            {lastUser ? lastUser.text : "Nouvelle conversation"}
                          </div>
                          <div style={{ position: "absolute", right: 6, top: 8, display: "flex", gap: 4 }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); startRename(c); }}
                              className="icon-btn-hover"
                              style={{ background: "none", border: "none", padding: 3, color: SUB, display: "flex", cursor: "pointer" }}
                              title="Renommer"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                              className="icon-btn-hover"
                              style={{ background: "none", border: "none", padding: 3, color: SUB, display: "flex", cursor: "pointer" }}
                              title="Supprimer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <Link
            to="/profile"
            className="icon-btn-hover"
            style={{ padding: 16, borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10, textDecoration: "none", cursor: "pointer" }}
          >
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: BLUE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {initials !== "?" ? initials : <User size={15} />}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {session ? `${session.prenom} ${session.nom}` : "Invité"}
              </div>
              <div style={{ fontSize: 10.5, color: SUB }}>Pro Learner Plan</div>
            </div>
          </Link>
        </aside>

        {/* ---------- Middle: chat ---------- */}
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: `1px solid ${BORDER}`, background: "#fff" }}>
            {editingId === active?.id ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  autoFocus
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmRename()}
                  style={{ fontSize: 16, fontWeight: 700, padding: "4px 8px", borderRadius: 6, border: `1px solid ${BORDER}`, outline: "none" }}
                />
                <Check size={16} color={GREEN} style={{ cursor: "pointer" }} onClick={confirmRename} />
                <X size={16} color={SUB} style={{ cursor: "pointer" }} onClick={() => setEditingId(null)} />
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: INK }}>{active?.title}</h1>
                <button
                  onClick={() => startRename(active)}
                  className="icon-btn-hover"
                  style={{ background: "none", border: "none", color: SUB, display: "flex", cursor: "pointer" }}
                  title="Renommer"
                >
                  <Pencil size={14} />
                </button>
              </div>
            )}
            <button
              onClick={() => deleteConversation(active.id)}
              className="icon-btn-hover"
              style={{ background: "none", border: "none", color: SUB, display: "flex", cursor: "pointer" }}
              title="Supprimer la conversation"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 18 }}
          >
            {active?.messages.map((m, i) =>
              m.role === "ia" ? (
                <div key={i} style={{ display: "flex", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Sparkle size={16} color="#fff" />
                  </div>
                  <div style={{ maxWidth: "75%" }}>
                    <div style={{ background: BLUE_SOFT, borderRadius: 12, padding: "14px 16px" }}>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: INK, whiteSpace: "pre-wrap" }}>{m.text}</p>
                      {m.sources && m.sources.length > 0 && (
                        <div style={{ marginTop: 10, fontSize: 11, color: SUB }}>Sources : {m.sources.join(", ")}</div>
                      )}
                    </div>
                    {m.time && <div style={{ fontSize: 10.5, color: SUB, marginTop: 5, marginLeft: 4 }}>{m.time}</div>}
                  </div>
                </div>
              ) : (
                <div key={i} style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <div style={{ background: BLUE, borderRadius: 12, padding: "14px 16px" }}>
                      <p style={{ margin: 0, fontSize: 14, color: "#fff" }}>{m.text}</p>
                    </div>
                    {m.time && <div style={{ fontSize: 10.5, color: SUB, marginTop: 5, marginRight: 4 }}>{m.time}</div>}
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: BLUE_SOFT, display: "flex", alignItems: "center", justifyContent: "center", color: BLUE, flexShrink: 0, fontSize: 11, fontWeight: 700 }}>
                    {initials !== "?" ? initials : <User size={16} />}
                  </div>
                </div>
              )
            )}

            {loading && (
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Sparkle size={16} color="#fff" />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: BLUE_SOFT, borderRadius: 12, padding: "12px 16px", fontSize: 13, fontStyle: "italic", color: SUB }}>
                  Searching knowledge base…
                </div>
              </div>
            )}

            {error && <div style={{ color: "#ba1a1a", fontSize: 13 }}>{error}</div>}
          </div>

          <form onSubmit={handleSend} style={{ display: "flex", alignItems: "center", gap: 10, padding: 16, borderTop: `1px solid ${BORDER}`, background: "#fff" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question about Linux, AI, or Networks..."
              style={{ flex: 1, background: PAGE_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 16px", outline: "none", fontSize: 14, color: INK }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="landing-cta-primary"
              style={{ display: "flex", alignItems: "center", gap: 8, color: "#fff", fontWeight: 700, fontSize: 13.5, padding: "12px 22px", borderRadius: 10, border: "none", opacity: loading || !input.trim() ? 0.6 : 1 }}
            >
              Envoyer <Send size={15} />
            </button>
          </form>
          <div style={{ fontSize: 10.5, color: SUB, textAlign: "center", paddingBottom: 10 }}>
            FhamIA can make mistakes. Verify important information from your course materials.
          </div>
        </main>

        {/* ---------- Right panel: context ---------- */}
        <aside style={{ width: 280, flexShrink: 0, borderLeft: `1px solid ${BORDER}`, background: "#fff", padding: 18, display: "flex", flexDirection: "column", gap: 18, overflowY: "auto" }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, color: SUB, textTransform: "uppercase", marginBottom: 10 }}>
              Current Context
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <select
                value={activeCourse.id}
                onChange={(e) => updateActive((c) => ({ ...c, courseId: e.target.value }))}
                style={{ width: "100%", fontSize: 12.5, fontWeight: 700, padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}`, color: INK, background: PAGE_BG }}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <div style={{ background: BLUE_SOFT, borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <activeCourse.icon size={15} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{activeCourse.title}</div>
                    <div style={{ fontSize: 10.5, color: SUB }}>{activeCourse.lessons}</div>
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: SUB, marginBottom: 4 }}>
                    <span>Progression</span>
                    <span style={{ fontWeight: 700, color: INK }}>{activeCourse.progress}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: "#dbe6fb", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${activeCourse.progress}%`, background: BLUE, borderRadius: 999 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, color: SUB, textTransform: "uppercase", marginBottom: 10 }}>
              Suggested Next
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendQuestion(s)}
                  disabled={loading}
                  className="btn-outline-hover"
                  style={{ display: "flex", alignItems: "center", gap: 8, textAlign: "left", background: PAGE_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 11px", fontSize: 12, color: INK, cursor: "pointer" }}
                >
                  <ArrowUpRight size={13} color={BLUE} style={{ flexShrink: 0 }} /> {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, color: SUB, textTransform: "uppercase", marginBottom: 10 }}>
              Recommended Resources
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button
                onClick={() => navigate(`/courses/${activeCourse.id}`)}
                className="btn-outline-hover"
                style={{ display: "flex", alignItems: "center", gap: 10, background: PAGE_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 11px", cursor: "pointer", textAlign: "left" }}
              >
                <BookOpen size={15} color={BLUE} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>Cours {activeCourse.title}</div>
                  <div style={{ fontSize: 10, color: SUB }}>Support de cours</div>
                </div>
              </button>
              {viz.length > 0 && (
                <button
                  onClick={() => navigate(`/visualisation/${activeCourse.id}`)}
                  className="btn-outline-hover"
                  style={{ display: "flex", alignItems: "center", gap: 10, background: PAGE_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 11px", cursor: "pointer", textAlign: "left" }}
                >
                  <Eye size={15} color={BLUE} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>{viz[0].titre}</div>
                    <div style={{ fontSize: 10, color: SUB }}>Visualisation interactive</div>
                  </div>
                </button>
              )}
              {quiz && (
                <button
                  onClick={() => navigate(`/quiz/${activeCourse.id}`)}
                  className="btn-outline-hover"
                  style={{ display: "flex", alignItems: "center", gap: 10, background: PAGE_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 11px", cursor: "pointer", textAlign: "left" }}
                >
                  <ClipboardList size={15} color={BLUE} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>{quiz.title}</div>
                    <div style={{ fontSize: 10, color: SUB }}>{quiz.questions.length} questions</div>
                  </div>
                </button>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, background: PAGE_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: INK }}>{totalQuestions}</div>
              <div style={{ fontSize: 9.5, color: SUB, textTransform: "uppercase", letterSpacing: 0.3 }}>Conversations</div>
            </div>
            <div style={{ flex: 1, background: PAGE_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: INK }}>{learningHours}h</div>
              <div style={{ fontSize: 9.5, color: SUB, textTransform: "uppercase", letterSpacing: 0.3 }}>Learning Time</div>
            </div>
          </div>

          {quiz && (
            <button
              onClick={() => navigate(`/quiz/${activeCourse.id}`)}
              style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: INK, color: "#fff", fontWeight: 700, fontSize: 13, padding: "12px 16px", borderRadius: 10, border: "none", cursor: "pointer" }}
            >
              <ClipboardList size={15} /> Take Chapter Quiz
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
