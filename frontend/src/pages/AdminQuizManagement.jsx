import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, ChevronDown, ChevronRight } from "lucide-react";
import AdminSidebar, { BLUE, BLUE_SOFT, INK, SUB, BORDER, PAGE_BG } from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import AdminEmptyState from "../components/AdminEmptyState";
import { api } from "../api";

const inputStyle = {
  width: "100%",
  background: PAGE_BG,
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  padding: "10px 12px",
  color: INK,
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  color: SUB,
  marginBottom: 6,
};

function QuestionRow({ question, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ enonce: question.enonce, choix: [...question.choix], reponse_correcte: question.reponse_correcte });
  const [error, setError] = useState("");

  const updateChoix = (i, value) => {
    const choix = [...form.choix];
    choix[i] = value;
    setForm({ ...form, choix });
  };

  const save = async () => {
    setError("");
    const choix = form.choix.filter((c) => c.trim());
    if (choix.length < 2 || !choix.includes(form.reponse_correcte)) {
      setError("Au moins 2 choix, et la bonne réponse doit correspondre exactement à un des choix.");
      return;
    }
    try {
      await api.patch(`/quiz/questions/${question.id}/`, { enonce: form.enonce, choix, reponse_correcte: form.reponse_correcte });
      setEditing(false);
      onUpdated();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async () => {
    if (!confirm("Supprimer cette question ?")) return;
    await api.delete(`/quiz/questions/${question.id}/`);
    onDeleted();
  };

  if (!editing) {
    return (
      <div style={{ fontSize: 13, color: SUB, padding: "6px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          {question.enonce} <span style={{ color: "#16a34a" }}>({question.reponse_correcte})</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", color: BLUE, cursor: "pointer" }}>
            <Pencil size={13} />
          </button>
          <button onClick={remove} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "10px 0", borderTop: `1px solid ${BORDER}` }}>
      {error && <div style={{ color: "#ba1a1a", fontSize: 12 }}>{error}</div>}
      <input style={inputStyle} value={form.enonce} onChange={(e) => setForm({ ...form, enonce: e.target.value })} />
      {form.choix.map((c, i) => (
        <input key={i} style={inputStyle} value={c} onChange={(e) => updateChoix(i, e.target.value)} />
      ))}
      <input
        style={inputStyle}
        placeholder="Bonne réponse"
        value={form.reponse_correcte}
        onChange={(e) => setForm({ ...form, reponse_correcte: e.target.value })}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={save} className="landing-cta-primary" style={{ color: "#fff", fontWeight: 700, fontSize: 12, border: "none", borderRadius: 8, padding: "6px 14px" }}>
          Enregistrer
        </button>
        <button onClick={() => setEditing(false)} style={{ background: "#fff", border: `1px solid ${BORDER}`, color: INK, fontSize: 12, borderRadius: 8, padding: "6px 14px" }}>
          Annuler
        </button>
      </div>
    </div>
  );
}

function QuestionForm({ quizId, onCreated }) {
  const [form, setForm] = useState({ enonce: "", choix: ["", "", "", ""], reponse_correcte: "" });
  const [error, setError] = useState("");

  const updateChoix = (i, value) => {
    const choix = [...form.choix];
    choix[i] = value;
    setForm({ ...form, choix });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const choix = form.choix.filter((c) => c.trim());
    if (choix.length < 2 || !choix.includes(form.reponse_correcte)) {
      setError("Ajoutez au moins 2 choix, et la bonne réponse doit correspondre exactement à l'un des choix.");
      return;
    }
    try {
      await api.post("/quiz/questions/", { quiz: quizId, enonce: form.enonce, choix, reponse_correcte: form.reponse_correcte });
      setForm({ enonce: "", choix: ["", "", "", ""], reponse_correcte: "" });
      onCreated();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 0", borderTop: `1px solid ${BORDER}` }}>
      {error && <div style={{ color: "#ba1a1a", fontSize: 12 }}>{error}</div>}
      <input
        style={inputStyle}
        placeholder="Énoncé de la question"
        value={form.enonce}
        onChange={(e) => setForm({ ...form, enonce: e.target.value })}
        required
      />
      {form.choix.map((c, i) => (
        <input
          key={i}
          style={inputStyle}
          placeholder={`Choix ${i + 1}`}
          value={c}
          onChange={(e) => updateChoix(i, e.target.value)}
        />
      ))}
      <input
        style={inputStyle}
        placeholder="Bonne réponse (doit correspondre à un des choix ci-dessus)"
        value={form.reponse_correcte}
        onChange={(e) => setForm({ ...form, reponse_correcte: e.target.value })}
        required
      />
      <button
        type="submit"
        className="landing-cta-primary"
        style={{
          alignSelf: "flex-start",
          color: "#fff",
          fontWeight: 700,
          fontSize: 12,
          border: "none",
          borderRadius: 8,
          padding: "8px 16px",
        }}
      >
        Ajouter la question
      </button>
    </form>
  );
}

export default function AdminQuizManagement() {
  const [list, setList] = useState([]);
  const [leconList, setLeconList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState({ lecon: "", titre: "", score_minimum: 50 });
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/quiz/quiz/"), api.get("/courses/lecons/")])
      .then(([quiz, lecons]) => {
        setList(quiz);
        setLeconList(lecons);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const titreLecon = (id) => leconList.find((l) => l.id === id)?.titre || "—";

  const startCreate = () => {
    setEditingId(null);
    setForm({ lecon: leconList[0]?.id || "", titre: "", score_minimum: 50 });
    setShowForm(true);
  };

  const startEdit = (q) => {
    setEditingId(q.id);
    setForm({ lecon: q.lecon, titre: q.titre, score_minimum: q.score_minimum });
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = { ...form, score_minimum: Number(form.score_minimum) };
    try {
      if (editingId) {
        await api.patch(`/quiz/quiz/${editingId}/`, payload);
      } else {
        await api.post("/quiz/quiz/", payload);
      }
      cancel();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce quiz et toutes ses questions ?")) return;
    await api.delete(`/quiz/quiz/${id}/`);
    load();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit" }}>
      <AdminSidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AdminHeader title="Quiz" />
        <main style={{ padding: "24px 32px 60px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: INK, margin: 0 }}>Quiz</h2>
            <button
              onClick={showForm ? cancel : startCreate}
              disabled={leconList.length === 0}
              className={showForm ? undefined : "landing-cta-primary"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: showForm ? "#fff" : undefined,
                border: showForm ? `1px solid ${BORDER}` : "none",
                color: showForm ? INK : "#fff",
                fontWeight: 700,
                fontSize: 12.5,
                borderRadius: 20,
                padding: "9px 16px",
                cursor: "pointer",
                opacity: leconList.length === 0 ? 0.5 : 1,
              }}
            >
              {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Annuler" : "Ajouter un quiz"}
            </button>
          </div>

          {leconList.length === 0 && !loading && (
            <p style={{ fontSize: 13, color: SUB }}>
              Créez d'abord une leçon dans l'onglet Lessons avant d'ajouter un quiz.
            </p>
          )}

          {showForm && (
            <form
              onSubmit={handleSubmit}
              style={{
                background: "#fff",
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: 22,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {error && <div style={{ color: "#ba1a1a", fontSize: 13 }}>{error}</div>}
              <div>
                <label style={labelStyle}>Leçon associée</label>
                <select
                  style={inputStyle}
                  value={form.lecon}
                  onChange={(e) => setForm({ ...form, lecon: Number(e.target.value) })}
                >
                  {leconList.map((l) => (
                    <option key={l.id} value={l.id}>{l.titre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Titre du quiz</label>
                <input
                  style={inputStyle}
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Score minimum (%)</label>
                <input
                  type="number"
                  style={inputStyle}
                  value={form.score_minimum}
                  onChange={(e) => setForm({ ...form, score_minimum: e.target.value })}
                  min={0}
                  max={100}
                />
              </div>
              <button
                type="submit"
                className="landing-cta-primary"
                style={{
                  alignSelf: "flex-start",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 22px",
                }}
              >
                {editingId ? "Enregistrer les modifications" : "Créer le quiz"}
              </button>
            </form>
          )}

          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
            {!loading && list.length === 0 && <AdminEmptyState />}
            {list.map((q) => (
              <div key={q.id} style={{ borderTop: `1px solid ${BORDER}`, padding: "12px 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <button
                    onClick={() => setExpanded(expanded === q.id ? null : q.id)}
                    style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer" }}
                  >
                    {expanded === q.id ? <ChevronDown size={16} color={SUB} /> : <ChevronRight size={16} color={SUB} />}
                    <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{q.titre}</span>
                    <span style={{ fontSize: 12, color: SUB }}>
                      &middot; {titreLecon(q.lecon)} &middot; {q.questions.length} questions
                    </span>
                  </button>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => startEdit(q)} style={{ background: "none", border: "none", color: BLUE, cursor: "pointer" }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(q.id)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {expanded === q.id && (
                  <div style={{ marginLeft: 24, marginTop: 10 }}>
                    {q.questions.map((qu) => (
                      <QuestionRow key={qu.id} question={qu} onUpdated={load} onDeleted={load} />
                    ))}
                    <QuestionForm quizId={q.id} onCreated={load} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
