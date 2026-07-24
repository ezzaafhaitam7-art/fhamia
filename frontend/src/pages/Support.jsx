import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, HelpCircle, ChevronDown, ChevronLeft, BookOpen, Mail, Clock3 } from "lucide-react";
import { api, getSession } from "../api";
import supportImg from "../assets/support.jpg";

const BLUE = "#1A56DB";
const BLUE_SOFT = "#EBF5FF";
const INK = "#191c1d";
const SUB = "#434654";
const BORDER = "#e5e7eb";
const PAGE_BG = "#f8f9fa";

const FAQ = [
  { q: "Comment créer un compte ?", a: "Cliquez sur \"S'inscrire\" depuis la page d'accueil, renseignez votre nom, votre email et un mot de passe, puis validez." },
  { q: "Comment réinitialiser mon mot de passe ?", a: "Depuis la page de connexion, cliquez sur \"Mot de passe oublié\" et suivez les instructions envoyées par email." },
  { q: "Comment obtenir mon certificat ?", a: "Terminez un parcours à 100% puis rendez-vous sur sa page pour cliquer sur \"Obtenir le certificat\"." },
  { q: "Comment utiliser le Playground ?", a: "Ouvrez un parcours, cliquez sur la carte \"Playground\" pour pratiquer les commandes dans un environnement réel et sécurisé." },
  { q: "Comment contacter le support ?", a: "Utilisez le formulaire ci-contre ou écrivez-nous directement à support@fhamia.com." },
];

export default function Support() {
  const session = getSession();
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ nom: "", email: "", sujet: "Assistance technique", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const filteredFaq = search.trim()
    ? FAQ.filter((f) => f.q.toLowerCase().includes(search.trim().toLowerCase()))
    : FAQ;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await api.post("/accounts/messages-support/", form);
      setSent(true);
      setForm({ nom: "", email: "", sujet: "Assistance technique", message: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit", display: "flex", flexDirection: "column" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderBottom: `1px solid ${BORDER}`, background: "#fff" }}>
        <Link to="/dashboard" style={{ fontSize: 20, fontWeight: 700, color: BLUE, textDecoration: "none", cursor: "pointer" }}>FhamIA</Link>
        <Link to="/profile" style={{ width: 34, height: 34, borderRadius: "50%", background: BLUE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
          {session ? `${session.prenom?.[0] || ""}${session.nom?.[0] || ""}` : "?"}
        </Link>
      </nav>

      <main style={{ width: "100%", maxWidth: 1280, margin: "0", padding: "20px 32px 60px", flex: 1, display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: SUB, textTransform: "uppercase" }}>
            <Link to="/dashboard" style={{ color: SUB }}>Accueil</Link> &gt; <span style={{ color: BLUE }}>Support</span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="back-btn"
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: `1px solid ${BORDER}`, color: INK, fontWeight: 600, fontSize: 12.5, borderRadius: 20, padding: "8px 14px", cursor: "pointer" }}
          >
            <ChevronLeft size={15} /> Retour
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 34, fontWeight: 800, margin: "0 0 10px", color: INK }}>Besoin d'aide ?</h1>
          <p style={{ fontSize: 15, color: SUB, margin: "0 0 24px" }}>Nous sommes là pour vous accompagner.</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 100, padding: "14px 22px", maxWidth: 560, margin: "0 auto", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
            <Search size={17} color="#9CA3AF" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une solution…"
              style={{ border: "none", outline: "none", flex: 1, fontSize: 14, background: "none", color: INK }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 32, alignItems: "stretch", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <img src={supportImg} alt="Support" style={{ width: "100%", maxWidth: 380, height: "auto", borderRadius: 16 }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <BookOpen size={19} color={BLUE} />
              <h2 style={{ fontSize: 17, fontWeight: 700, color: INK, margin: 0 }}>Questions fréquentes (FAQ)</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredFaq.map((f, i) => {
                const open = openIndex === i;
                const hovered = hoverIndex === i;
                return (
                  <div
                    key={f.q}
                    style={{
                      background: "#fff",
                      border: `1px solid ${open || hovered ? BLUE : BORDER}`,
                      borderRadius: 12,
                      overflow: "hidden",
                      transition: "border-color 0.15s",
                    }}
                  >
                    <button
                      onClick={() => setOpenIndex(open ? null : i)}
                      onMouseEnter={() => setHoverIndex(i)}
                      onMouseLeave={() => setHoverIndex(null)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 18px",
                        background: hovered || open ? BLUE_SOFT : "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.15s",
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 700, color: hovered || open ? BLUE : INK, transition: "color 0.15s" }}>{f.q}</span>
                      <ChevronDown size={17} color={BLUE} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
                    </button>
                    {open && (
                      <p style={{ margin: 0, padding: "14px 18px 16px", fontSize: 13.5, color: SUB, lineHeight: 1.6 }}>{f.a}</p>
                    )}
                  </div>
                );
              })}
              {filteredFaq.length === 0 && (
                <p style={{ fontSize: 13.5, color: SUB }}>Aucun résultat pour "{search}".</p>
              )}
            </div>

            <div style={{ height: 24 }} />

            <div style={{ background: BLUE_SOFT, borderRadius: 16, padding: 22, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <HelpCircle size={20} color={BLUE} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, marginBottom: 2 }}>Vous ne trouvez pas votre réponse ?</div>
                <div style={{ fontSize: 12.5, color: SUB }}>Écrivez-nous directement via le formulaire à droite, notre équipe vous répond rapidement.</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, height: "100%" }}>
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28, flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <Mail size={19} color={BLUE} />
                <h2 style={{ fontSize: 17, fontWeight: 700, color: INK, margin: 0 }}>Nous contacter</h2>
              </div>
              {sent && (
                <p style={{ fontSize: 13, color: "#16a34a", marginBottom: 14 }}>
                  Votre message a bien été envoyé. Notre équipe vous répondra rapidement.
                </p>
              )}
              {error && <p style={{ fontSize: 13, color: "#ba1a1a", marginBottom: 14 }}>{error}</p>}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: INK, marginBottom: 6 }}>Nom</label>
                  <input
                    required
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    placeholder="Votre nom complet"
                    style={{ width: "100%", boxSizing: "border-box", background: BLUE_SOFT, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "11px 14px", fontSize: 13.5, color: INK, outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: INK, marginBottom: 6 }}>Email</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="votre@email.com"
                    style={{ width: "100%", boxSizing: "border-box", background: BLUE_SOFT, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "11px 14px", fontSize: 13.5, color: INK, outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: INK, marginBottom: 6 }}>Sujet</label>
                  <select
                    value={form.sujet}
                    onChange={(e) => setForm({ ...form, sujet: e.target.value })}
                    style={{ width: "100%", boxSizing: "border-box", background: BLUE_SOFT, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "11px 14px", fontSize: 13.5, color: INK, outline: "none" }}
                  >
                    <option>Assistance technique</option>
                    <option>Question sur un cours</option>
                    <option>Facturation</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: INK, marginBottom: 6 }}>Message</label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Comment pouvons-nous vous aider ?"
                    style={{ width: "100%", boxSizing: "border-box", resize: "vertical", background: BLUE_SOFT, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "11px 14px", fontSize: 13.5, color: INK, outline: "none", fontFamily: "inherit", flex: 1, minHeight: 100 }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="landing-cta-primary"
                  style={{ color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px", borderRadius: 10, border: "none", cursor: "pointer", opacity: sending ? 0.6 : 1 }}
                >
                  {sending ? "Envoi…" : "Envoyer le message"}
                </button>
              </form>
            </div>

            <div style={{ background: BLUE_SOFT, borderRadius: 16, padding: 22 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: INK, margin: "0 0 14px" }}>Autres moyens de contact</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 14, borderBottom: `1px solid #d7e3fb` }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Mail size={16} color={BLUE} />
                </div>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: SUB, textTransform: "uppercase" }}>Email</div>
                  <a href="mailto:support@fhamia.com" style={{ fontSize: 13.5, fontWeight: 700, color: BLUE }}>support@fhamia.com</a>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 14 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Clock3 size={16} color={BLUE} />
                </div>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: SUB, textTransform: "uppercase" }}>Horaires</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>Lun - Ven : 09:00 - 18:00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${BORDER}`, background: "#fff", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 12, color: SUB }}>
          <strong style={{ color: INK }}>FhamIA</strong> &middot; &copy; 2026 FhamIA. Tous droits réservés.
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 12, color: SUB }}>
          <span>Confidentialité</span>
          <Link to="/terms" style={{ color: SUB }}>Conditions</Link>
          <Link to="/support" style={{ color: SUB }}>Support</Link>
        </div>
      </footer>
    </div>
  );
}
