import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import AdminSidebar, { BLUE, BLUE_SOFT, INK, SUB, BORDER, PAGE_BG } from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import AdminEmptyState from "../components/AdminEmptyState";
import { api } from "../api";

const columns = ["Utilisateur", "Parcours", "Code de vérification", "Date d'obtention", ""];

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

function genererCode() {
  return `FH-${Math.random().toString(16).slice(2, 12).toUpperCase()}`;
}

export default function AdminCertificates() {
  const [list, setList] = useState([]);
  const [users, setUsers] = useState([]);
  const [parcoursList, setParcoursList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ utilisateur: "", parcours: "", code_verification: "" });
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/accounts/certificats/"), api.get("/accounts/utilisateurs/"), api.get("/courses/parcours/")])
      .then(([certs, us, pcs]) => {
        setList(certs);
        setUsers(us);
        setParcoursList(pcs);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const nomUtilisateur = (id) => {
    const u = users.find((u) => u.id === id);
    return u ? `${u.prenom} ${u.nom}` : "—";
  };
  const titreParcours = (id) => parcoursList.find((p) => p.id === id)?.titre || "—";

  const startCreate = () => {
    setEditingId(null);
    setForm({ utilisateur: users[0]?.id || "", parcours: parcoursList[0]?.id || "", code_verification: genererCode() });
    setShowForm(true);
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({ utilisateur: c.utilisateur, parcours: c.parcours, code_verification: c.code_verification });
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
    try {
      if (editingId) {
        await api.patch(`/accounts/certificats/${editingId}/`, form);
      } else {
        await api.post("/accounts/certificats/", form);
      }
      cancel();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce certificat ?")) return;
    await api.delete(`/accounts/certificats/${id}/`);
    load();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit" }}>
      <AdminSidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AdminHeader title="Certificates" />
        <main style={{ padding: "24px 32px 60px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: INK, margin: 0 }}>Certificats</h2>
            <button
              onClick={showForm ? cancel : startCreate}
              disabled={users.length === 0 || parcoursList.length === 0}
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
                opacity: users.length === 0 || parcoursList.length === 0 ? 0.5 : 1,
              }}
            >
              {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Annuler" : "Émettre un certificat"}
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
                <label style={labelStyle}>Utilisateur</label>
                <select style={inputStyle} value={form.utilisateur} onChange={(e) => setForm({ ...form, utilisateur: Number(e.target.value) })}>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Parcours</label>
                <select style={inputStyle} value={form.parcours} onChange={(e) => setForm({ ...form, parcours: Number(e.target.value) })}>
                  {parcoursList.map((p) => (
                    <option key={p.id} value={p.id}>{p.titre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Code de vérification</label>
                <input style={inputStyle} value={form.code_verification} onChange={(e) => setForm({ ...form, code_verification: e.target.value })} required />
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
                {editingId ? "Enregistrer les modifications" : "Émettre le certificat"}
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
                {list.map((c) => (
                  <tr key={c.id} style={{ borderTop: `1px solid ${BORDER}`, fontSize: 13 }}>
                    <td style={{ padding: "10px 6px", color: INK, fontWeight: 600 }}>{nomUtilisateur(c.utilisateur)}</td>
                    <td style={{ padding: "10px 6px", color: SUB }}>{titreParcours(c.parcours)}</td>
                    <td style={{ padding: "10px 6px", color: SUB, fontFamily: "var(--mono)" }}>{c.code_verification}</td>
                    <td style={{ padding: "10px 6px", color: SUB }}>
                      {new Date(c.date_obtention).toLocaleDateString("fr-FR")}
                    </td>
                    <td style={{ padding: "10px 6px", display: "flex", gap: 10 }}>
                      <button onClick={() => startEdit(c)} style={{ background: "none", border: "none", color: BLUE, cursor: "pointer" }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}>
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
