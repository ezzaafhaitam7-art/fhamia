import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import AdminSidebar, { BLUE, BLUE_SOFT, INK, SUB, BORDER, PAGE_BG } from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import AdminEmptyState from "../components/AdminEmptyState";
import { api } from "../api";

const columns = ["Titre", "Niveau", "Description", "Nb de leçons", ""];
const emptyForm = { titre: "", niveau: "", description: "" };

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

export default function AdminPaths() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/courses/parcours/")
      .then(setList)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startCreate = () => {
    setEditingSlug(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (p) => {
    setEditingSlug(p.slug);
    setForm({ titre: p.titre, niveau: p.niveau, description: p.description });
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditingSlug(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingSlug) {
        await api.patch(`/courses/parcours/${editingSlug}/`, form);
      } else {
        await api.post("/courses/parcours/", form);
      }
      cancel();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (slug) => {
    if (!confirm("Supprimer ce parcours et toutes ses leçons/quiz associés ?")) return;
    await api.delete(`/courses/parcours/${slug}/`);
    load();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit" }}>
      <AdminSidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AdminHeader title="Paths" />
        <main style={{ padding: "24px 32px 60px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: INK, margin: 0 }}>Parcours</h2>
            <button
              onClick={showForm ? cancel : startCreate}
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
              }}
            >
              {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Annuler" : "Ajouter un parcours"}
            </button>
          </div>

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
                <label style={labelStyle}>Titre</label>
                <input
                  style={inputStyle}
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Niveau</label>
                <input
                  style={inputStyle}
                  value={form.niveau}
                  onChange={(e) => setForm({ ...form, niveau: e.target.value })}
                  placeholder="Débutant, Intermédiaire, Avancé…"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
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
                {editingSlug ? "Enregistrer les modifications" : "Créer le parcours"}
              </button>
            </form>
          )}

          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5, color: SUB }}>
                  {columns.map((c) => (
                    <th key={c} style={{ padding: "8px 6px", fontWeight: 700 }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loading && list.length === 0 && (
                  <tr>
                    <td colSpan={columns.length}>
                      <AdminEmptyState />
                    </td>
                  </tr>
                )}
                {list.map((p) => (
                  <tr key={p.id} style={{ borderTop: `1px solid ${BORDER}`, fontSize: 13 }}>
                    <td style={{ padding: "10px 6px", color: INK, fontWeight: 600 }}>{p.titre}</td>
                    <td style={{ padding: "10px 6px", color: SUB }}>{p.niveau}</td>
                    <td style={{ padding: "10px 6px", color: SUB, maxWidth: 300 }}>{p.description}</td>
                    <td style={{ padding: "10px 6px", color: SUB }}>{p.lecons.length}</td>
                    <td style={{ padding: "10px 6px", display: "flex", gap: 10 }}>
                      <button
                        onClick={() => startEdit(p)}
                        style={{ background: "none", border: "none", color: BLUE, cursor: "pointer" }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.slug)}
                        style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
