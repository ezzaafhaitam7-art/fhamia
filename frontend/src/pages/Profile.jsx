import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  User,
  Shield,
  Calendar,
  Eye,
  EyeOff,
  ArrowLeft,
  BarChart3,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Clock3,
  Bot,
  Terminal,
  Award,
  TrendingUp,
} from "lucide-react";
import { api, getSession, saveSession } from "../api";
import { getActivity } from "../utils/lmsStorage";

const BLUE = "#1A56DB";
const BLUE_SOFT = "#EBF5FF";
const INK = "#191c1d";
const SUB = "#434654";
const BORDER = "#e5e7eb";
const PAGE_BG = "#f8f9fa";

const TABS = [
  { key: "infos", label: "Informations", icon: User },
  { key: "securite", label: "Sécurité", icon: Shield },
];

const fieldStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: "#fbfcfe",
  border: `1.5px solid ${BORDER}`,
  borderRadius: 10,
  padding: "14px 16px",
  fontSize: 14,
  color: INK,
  outline: "none",
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: SUB,
  textTransform: "uppercase",
  letterSpacing: 0.4,
  marginBottom: 8,
};

export default function Profile() {
  const session = getSession();
  const [tab, setTab] = useState("infos");
  const [prenom, setPrenom] = useState(session?.prenom || "");
  const [nom, setNom] = useState(session?.nom || "");
  const [email, setEmail] = useState(session?.email || "");
  const [motDePasseActuel, setMotDePasseActuel] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmerMotDePasse, setConfirmerMotDePasse] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [progressions, setProgressions] = useState([]);
  const [certificats, setCertificats] = useState([]);

  useEffect(() => {
    if (!session) return;
    Promise.all([
      api.get("/quiz/progressions/").catch(() => []),
      api.get("/accounts/certificats/").catch(() => []),
    ]).then(([progs, certs]) => {
      setProgressions(progs.filter((p) => p.utilisateur === session.id));
      setCertificats(certs.filter((c) => c.utilisateur === session.id));
    });
  }, []);

  if (!session) return <Navigate to="/login" replace />;

  const initials = `${session.prenom?.[0] || ""}${session.nom?.[0] || ""}`;

  const activity = getActivity(session);
  const countActivity = (type) => activity.filter((a) => a.type === type).length;
  const conversationsCount = (() => {
    try {
      const raw = localStorage.getItem(`fhamia-tutor-conversations-${session.id}`);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  })();
  const progressionGlobale = progressions.length
    ? Math.round(progressions.reduce((sum, p) => sum + p.pourcentage, 0) / progressions.length)
    : 0;
  const learningMinutes = activity.length * 6 + conversationsCount * 4;
  const learningLabel = learningMinutes >= 60 ? `${(learningMinutes / 60).toFixed(1)}h` : `${learningMinutes} min`;

  const stats = [
    { icon: GraduationCap, label: "Parcours suivis", value: progressions.length },
    { icon: BookOpen, label: "Cours consultés", value: countActivity("cours") },
    { icon: ClipboardCheck, label: "Quiz réussis", value: countActivity("quiz") },
    { icon: Clock3, label: "Temps d'apprentissage", value: learningLabel },
    { icon: Bot, label: "Conversations tuteur IA", value: conversationsCount },
    { icon: Terminal, label: "Playgrounds réalisés", value: countActivity("playground") },
    { icon: Eye, label: "Visualisations consultées", value: countActivity("visualisation") },
    { icon: Award, label: "Certificats obtenus", value: certificats.length },
    { icon: TrendingUp, label: "Progression globale", value: `${progressionGlobale}%` },
  ];

  const handleCancel = () => {
    setPrenom(session.prenom || "");
    setNom(session.nom || "");
    setEmail(session.email || "");
    setMotDePasseActuel("");
    setNouveauMotDePasse("");
    setConfirmerMotDePasse("");
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    if (nouveauMotDePasse) {
      if (!motDePasseActuel) {
        setError("Veuillez saisir votre mot de passe actuel.");
        return;
      }
      if (nouveauMotDePasse !== confirmerMotDePasse) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }
    }
    setSaving(true);
    try {
      const payload = { prenom, nom, email };
      if (nouveauMotDePasse) {
        payload.password = nouveauMotDePasse;
        payload.ancien_mot_de_passe = motDePasseActuel;
      }
      const updated = await api.patch(`/accounts/utilisateurs/${session.id}/`, payload);
      saveSession({ ...session, ...updated });
      setMotDePasseActuel("");
      setNouveauMotDePasse("");
      setConfirmerMotDePasse("");
      setSuccess("Vos modifications ont été enregistrées.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit", display: "flex", flexDirection: "column" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderBottom: `1px solid ${BORDER}`, background: "#fff" }}>
        <Link to="/dashboard" style={{ fontSize: 20, fontWeight: 700, color: BLUE, textDecoration: "none", cursor: "pointer" }}>FhamIA</Link>
        <Link to="/profile" style={{ width: 34, height: 34, borderRadius: "50%", background: BLUE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
          {initials}
        </Link>
      </nav>

      <main style={{ width: "100%", padding: "20px 32px 60px", flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: SUB, textTransform: "uppercase", marginBottom: 6 }}>
          <Link to="/dashboard" style={{ color: SUB }}>Accueil</Link> &gt; <span style={{ color: INK }}>Mon Profil</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 6px", color: INK }}>Mon Profil</h1>
            <p style={{ fontSize: 14, color: SUB, margin: 0 }}>Consultez et mettez à jour vos informations personnelles.</p>
          </div>
          <Link
            to="/dashboard"
            className="back-btn"
            style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: `1.5px solid ${BORDER}`, color: INK, fontWeight: 600, fontSize: 13.5, padding: "10px 18px", borderRadius: 10, textDecoration: "none", whiteSpace: "nowrap" }}
          >
            <ArrowLeft size={16} /> Retour
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "290px 1fr", gap: 24, alignItems: "start" }}>
          {/* Colonne gauche — profil + navigation, fixe */}
          <div style={{ position: "sticky", top: 20, alignSelf: "start", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 18, padding: 26, boxShadow: "0 1px 3px rgba(16,24,40,0.04)" }}>
            <div style={{ textAlign: "center", paddingBottom: 22, borderBottom: `1px solid ${BORDER}`, marginBottom: 18 }}>
              <div style={{ width: 84, height: 84, borderRadius: "50%", background: `linear-gradient(135deg, ${BLUE}, #3b7ef0)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, margin: "0 auto 16px", boxShadow: "0 8px 20px -6px rgba(26,86,219,0.45)" }}>
                {initials}
              </div>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: INK, marginBottom: 4 }}>{session.prenom} {session.nom}</div>
              <div style={{ fontSize: 12.5, color: SUB, marginBottom: 12, wordBreak: "break-all" }}>{session.email}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: BLUE_SOFT, color: BLUE, fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 20 }}>
                <Calendar size={12} /> Membre depuis {session.date_inscription ? new Date(session.date_inscription).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }) : "—"}
              </div>
            </div>

            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: SUB, textTransform: "uppercase", marginBottom: 10, paddingLeft: 4 }}>
              Paramètres du compte
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {TABS.map((t) => (
                <button
                  key={t.key}
                  className="profile-tab-btn"
                  onClick={() => setTab(t.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    padding: "12px 14px",
                    borderRadius: 10,
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: tab === t.key ? "#fff" : INK,
                    background: tab === t.key ? BLUE : "transparent",
                    boxShadow: tab === t.key ? "0 6px 16px -6px rgba(26,86,219,0.55)" : "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s, box-shadow 0.15s",
                  }}
                >
                  <t.icon size={16} color={tab === t.key ? "#fff" : SUB} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Colonne droite — uniquement la section sélectionnée */}
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 18, boxShadow: "0 1px 3px rgba(16,24,40,0.04)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "stretch", minHeight: 620 }}>
              <div style={{ flex: "1 1 0", padding: "34px 36px", display: "flex", flexDirection: "column" }}>
                {tab === "infos" && (
                  <>
                    <div style={{ marginBottom: 28 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: BLUE_SOFT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <User size={17} color={BLUE} />
                        </div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: INK, margin: 0 }}>Informations personnelles</h2>
                      </div>
                      <p style={{ fontSize: 12.5, color: SUB, margin: "0 0 0 44px" }}>Gérez les informations affichées sur votre profil.</p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 22 }}>
                      <div>
                        <label style={labelStyle}>Prénom</label>
                        <input className="profile-field" value={prenom} onChange={(e) => setPrenom(e.target.value)} style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Nom</label>
                        <input className="profile-field" value={nom} onChange={(e) => setNom(e.target.value)} style={fieldStyle} />
                      </div>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <label style={labelStyle}>Adresse e-mail</label>
                      <input className="profile-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle} />
                    </div>

                    <div style={{ marginTop: 30, paddingTop: 26, borderTop: `1px solid ${BORDER}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: BLUE_SOFT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <BarChart3 size={17} color={BLUE} />
                        </div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: INK, margin: 0 }}>Mes statistiques</h2>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                        {stats.map((s) => (
                          <div key={s.label} style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: BLUE_SOFT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <s.icon size={15} color={BLUE} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 16, fontWeight: 800, color: INK, lineHeight: 1.1 }}>{s.value}</div>
                              <div style={{ fontSize: 10.5, color: SUB, marginTop: 2 }}>{s.label}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ flex: 1 }} />

                    <div style={{ background: BLUE_SOFT, borderRadius: 12, padding: "16px 18px", fontSize: 12.5, color: SUB, marginTop: 24 }}>
                      Ces informations sont visibles par notre équipe support pour vous accompagner au mieux.
                    </div>
                  </>
                )}

                {tab === "securite" && (
                  <>
                    <div style={{ marginBottom: 28 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: BLUE_SOFT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Shield size={17} color={BLUE} />
                        </div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: INK, margin: 0 }}>Sécurité du compte</h2>
                      </div>
                      <p style={{ fontSize: 12.5, color: SUB, margin: "0 0 0 44px" }}>Mettez à jour votre mot de passe régulièrement.</p>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                      <label style={labelStyle}>Mot de passe actuel</label>
                      <div style={{ position: "relative" }}>
                        <input
                          className="profile-field"
                          type={showCurrent ? "text" : "password"}
                          value={motDePasseActuel}
                          onChange={(e) => setMotDePasseActuel(e.target.value)}
                          style={{ ...fieldStyle, paddingRight: 44 }}
                        />
                        <button type="button" onClick={() => setShowCurrent((v) => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: SUB, display: "flex" }}>
                          {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 8 }}>
                      <div>
                        <label style={labelStyle}>Nouveau mot de passe</label>
                        <div style={{ position: "relative" }}>
                          <input
                            className="profile-field"
                            type={showNew ? "text" : "password"}
                            value={nouveauMotDePasse}
                            onChange={(e) => setNouveauMotDePasse(e.target.value)}
                            placeholder="Min. 8 caractères"
                            style={{ ...fieldStyle, paddingRight: 44 }}
                          />
                          <button type="button" onClick={() => setShowNew((v) => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: SUB, display: "flex" }}>
                            {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Confirmer le mot de passe</label>
                        <div style={{ position: "relative" }}>
                          <input
                            className="profile-field"
                            type={showConfirm ? "text" : "password"}
                            value={confirmerMotDePasse}
                            onChange={(e) => setConfirmerMotDePasse(e.target.value)}
                            placeholder="Confirmez votre mot de passe"
                            style={{ ...fieldStyle, paddingRight: 44 }}
                          />
                          <button type="button" onClick={() => setShowConfirm((v) => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: SUB, display: "flex" }}>
                            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ flex: 1 }} />

                    <div style={{ background: BLUE_SOFT, borderRadius: 12, padding: "16px 18px", fontSize: 12.5, color: SUB, marginTop: 24 }}>
                      Utilisez un mot de passe fort d'au moins 8 caractères, combinant lettres, chiffres et symboles.
                    </div>
                  </>
                )}

                {error && <p style={{ color: "#ba1a1a", fontSize: 13, margin: "16px 0 0" }}>{error}</p>}
                {success && <p style={{ color: "#16a34a", fontSize: 13, margin: "16px 0 0" }}>{success}</p>}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 26, paddingTop: 22, borderTop: `1px solid ${BORDER}` }}>
                  <button
                    onClick={handleCancel}
                    style={{ background: "#fff", border: `1.5px solid ${BORDER}`, color: SUB, fontWeight: 600, fontSize: 13.5, padding: "12px 22px", borderRadius: 10, cursor: "pointer" }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="landing-cta-primary"
                    style={{ color: "#fff", fontWeight: 700, fontSize: 13.5, padding: "12px 24px", borderRadius: 10, border: "none", cursor: "pointer", opacity: saving ? 0.6 : 1 }}
                  >
                    {saving ? "Enregistrement…" : "Enregistrer les modifications"}
                  </button>
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
          <Link to="/terms" style={{ color: SUB }}>Conditions</Link>
          <Link to="/support" style={{ color: SUB }}>Support</Link>
        </div>
      </footer>
    </div>
  );
}
