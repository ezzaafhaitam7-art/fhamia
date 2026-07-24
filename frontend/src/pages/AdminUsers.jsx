import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import AdminSidebar, { BLUE, BLUE_SOFT, INK, SUB, BORDER, PAGE_BG } from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import AdminEmptyState from "../components/AdminEmptyState";
import { api } from "../api";

const columns = ["Prénom", "Nom", "Email", "État du compte", "Date d'inscription", ""];
const emptyForm = { prenom: "", nom: "", email: "", password: "", etat_compte: "actif" };

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

export default function AdminUsers() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/accounts/utilisateurs/").then(setList).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setForm({ prenom: u.prenom, nom: u.nom, email: u.email, password: "", etat_compte: u.etat_compte });
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
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    try {
      if (editingId) {
        await api.patch(`/accounts/utilisateurs/${editingId}/`, payload);
      } else {
        await api.post("/accounts/utilisateurs/", payload);
      }
      cancel();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await api.delete(`/accounts/utilisateurs/${id}/`);
    load();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit" }}>
      <AdminSidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AdminHeader title="Utilisateurs" />
        <main style={{ padding: "24px 32px 60px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: INK, margin: 0 }}>Utilisateurs</h2>
            <button
              onClick={showForm ? cancel : startCreate}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: showForm ? "#fff" : BLUE,
                border: showForm ? `1px solid ${BORDER}` : "none",
                color: showForm ? INK : "#fff",
                fontWeight: 700,
                fontSize: 12.5,
                borderRadius: 20,
                padding: "9px 16px",
                cursor: "pointer",
              }}
            >
              {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Annuler" : "Ajouter un utilisateur"}
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
              <div style={{ display: "flex", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Prénom</label>
                  <input style={inputStyle} value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Nom</label>
                  <input style={inputStyle} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" style={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label style={labelStyle}>
                  Mot de passe {editingId && "(laisser vide pour ne pas changer)"}
                </label>
                <input
                  type="password"
                  style={inputStyle}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editingId}
                />
              </div>
              <div>
                <label style={labelStyle}>État du compte</label>
                <select style={inputStyle} value={form.etat_compte} onChange={(e) => setForm({ ...form, etat_compte: e.target.value })}>
                  <option value="actif">Actif</option>
                  <option value="suspendu">Suspendu</option>
                </select>
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
                {editingId ? "Enregistrer les modifications" : "Créer l'utilisateur"}
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
                {list.map((u) => (
                  <tr key={u.id} style={{ borderTop: `1px solid ${BORDER}`, fontSize: 13 }}>
                    <td style={{ padding: "10px 6px", color: INK, fontWeight: 600 }}>{u.prenom}</td>
                    <td style={{ padding: "10px 6px", color: INK, fontWeight: 600 }}>{u.nom}</td>
                    <td style={{ padding: "10px 6px", color: SUB }}>{u.email}</td>
                    <td style={{ padding: "10px 6px" }}>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "3px 10px",
                          borderRadius: 20,
                          color: u.etat_compte === "actif" ? "#16a34a" : "#dc2626",
                          background: u.etat_compte === "actif" ? "#f0fdf4" : "#fef2f2",
                        }}
                      >
                        {u.etat_compte}
                      </span>
                    </td>
                    <td style={{ padding: "10px 6px", color: SUB }}>
                      {new Date(u.date_inscription).toLocaleDateString("fr-FR")}
                    </td>
                    <td style={{ padding: "10px 6px", display: "flex", gap: 10 }}>
                      <button onClick={() => startEdit(u)} style={{ background: "none", border: "none", color: BLUE, cursor: "pointer" }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}>
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
