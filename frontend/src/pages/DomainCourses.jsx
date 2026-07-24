import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart2,
  Clock,
  Sparkles,
  FileText,
  Box,
  Terminal,
  ClipboardCheck,
  MessageSquare,
  Award,
  Lock,
  Check,
} from "lucide-react";
import { BigIllustration } from "./Courses";
import { domainMeta } from "../data/domainCourses";
import { api, getSession } from "../api";
import BackButton from "../components/BackButton";
import { logActivity } from "../utils/lmsStorage";

const BLUE = "#1A56DB";
const BLUE_SOFT = "#EBF5FF";
const INK = "#191c1d";
const SUB = "#434654";
const BORDER = "#e5e7eb";
const PAGE_BG = "#f8f9fa";

const card = { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16 };

const features = [
  { key: "pdf", icon: FileText, title: "Cours PDF", text: "Lire le cours complet avec des annotations détaillées.", cta: "Commencer" },
  { key: "3d", icon: Box, title: "Visualisation 3D", text: "Explorer des animations interactives sur l'architecture.", cta: "Explorer" },
  { key: "playground", icon: Terminal, title: "Playground", text: "Pratiquer directement les commandes en temps réel.", cta: "Pratiquer", primary: true },
  { key: "quiz", icon: ClipboardCheck, title: "Quiz", text: "Évaluer vos connaissances et gagner des points.", cta: "Commencer" },
  { key: "tutor", icon: MessageSquare, title: "Tuteur IA", text: "Poser des questions complexes en français ou en darija.", cta: "Discuter", outline: true },
];

export default function DomainCourses() {
  const { domainId } = useParams();
  const session = getSession();

  const [parcours, setParcours] = useState(null);
  const [allParcours, setAllParcours] = useState([]);
  const [progressions, setProgressions] = useState([]);
  const [certificat, setCertificat] = useState(null);
  const [error, setError] = useState("");
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    if (!domainId) return;
    api.get(`/courses/parcours/${domainId}/`).then(setParcours).catch((err) => setError(err.message));
    api.get("/courses/parcours/").then(setAllParcours).catch(() => {});

    if (session) {
      api.post(`/courses/parcours/${domainId}/suivre/`, { utilisateur: session.id }).catch(() => {});
      api
        .get("/quiz/progressions/")
        .then((progs) => setProgressions(progs.filter((p) => p.utilisateur === session.id)))
        .catch(() => {});
      api
        .get("/accounts/certificats/")
        .then((certs) => setCertificat(certs.find((c) => c.utilisateur === session.id) || null))
        .catch(() => {});
    }
  }, [domainId]);

  if (error) return <Navigate to="/courses" replace />;

  const meta = domainMeta[domainId] || { title: parcours?.titre || "" };
  const progression = parcours ? progressions.find((p) => p.parcours === parcours.id) : null;
  const pct = progression ? Math.round(progression.pourcentage) : 0;
  const totalMin = parcours ? parcours.lecons.reduce((s, l) => s + (l.duree || 0), 0) : 0;
  const remainingH = totalMin ? Math.max(1, Math.round((totalMin * (1 - pct / 100)) / 60)) : null;
  const firstLecon = parcours?.lecons?.[0];
  const isDone = pct >= 100;

  const handleObtenirCertificat = async () => {
    setIssuing(true);
    try {
      const c = await api.post("/accounts/obtenir-certificat/", { utilisateur: session.id, parcours: parcours.id });
      setCertificat(c);
      logActivity(session, { type: "certificat", title: "Certificat obtenu", description: c.parcours_titre });
    } catch (err) {
      alert(err.message);
    } finally {
      setIssuing(false);
    }
  };

  const featureLink = (key) => {
    if (key === "pdf") return firstLecon ? `/courses/${domainId}/${firstLecon.id}` : "#";
    if (key === "3d") return `/visualisation/${domainId}`;
    if (key === "playground") return `/ai-lab/${domainId}`;
    if (key === "quiz") return `/quiz/${domainId}`;
    return "/tutor";
  };

  const others = allParcours.filter((p) => p.slug !== domainId).slice(0, 3);

  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: `1px solid ${BORDER}`, background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <BackButton to="/courses" />
          <span style={{ fontSize: 20, fontWeight: 700, color: BLUE }}>FhamIA</span>
        </div>
        <Link to="/profile" style={{ width: 34, height: 34, borderRadius: "50%", background: BLUE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
          {session ? `${session.prenom?.[0] || ""}${session.nom?.[0] || ""}` : "?"}
        </Link>
      </nav>

      <main style={{ width: "100%", padding: "24px 32px 60px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: SUB, textTransform: "uppercase" }}>
          <Link to="/dashboard" style={{ color: SUB }}>Accueil</Link> &gt; <Link to="/courses" style={{ color: SUB }}>Parcours</Link> &gt;{" "}
          <span style={{ color: INK }}>{meta.title}</span>
        </div>

        {!parcours && !error && <p style={{ color: SUB, fontSize: 14 }}>Chargement…</p>}

        {parcours && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 32, alignItems: "center" }}>
              <div>
                <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 12px", color: INK, letterSpacing: -0.3 }}>{parcours.titre}</h1>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: SUB, margin: "0 0 18px", maxWidth: 500 }}>{parcours.description}</p>
                <div style={{ display: "flex", gap: 20, marginBottom: 24, fontSize: 13.5, color: SUB, flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}><BarChart2 size={15} color={BLUE} /> {parcours.niveau}</span>
                  {totalMin > 0 && <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={15} color={BLUE} /> {Math.round(totalMin / 60)}h</span>}
                  {session && <span style={{ display: "flex", alignItems: "center", gap: 6, color: BLUE, fontWeight: 700 }}><Sparkles size={15} /> {pct}% complété</span>}
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <Link
                    to={firstLecon ? `/courses/${domainId}/${firstLecon.id}` : "#"}
                    className="landing-cta-primary"
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#fff", fontWeight: 700, fontSize: 14, padding: "13px 24px", borderRadius: 10, border: "none" }}
                  >
                    {pct > 0 ? "Continuer le parcours" : "Commencer le parcours"} <ArrowRight size={16} />
                  </Link>
                  <a href="#programme" className="btn-outline-hover" style={{ display: "inline-flex", alignItems: "center", fontWeight: 700, fontSize: 14, padding: "13px 24px", borderRadius: 10, border: `1.5px solid ${BORDER}`, color: INK }}>
                    Détails du programme
                  </a>
                </div>
              </div>
              <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 50px -20px rgba(26,86,219,0.35)" }}>
                <BigIllustration slug={domainId} />
              </div>
            </div>

            <div id="programme" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24, alignItems: "start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {session && (
                  <div style={{ ...card, padding: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <h2 style={{ fontSize: 17, fontWeight: 700, color: INK, margin: "0 0 4px" }}>Progression globale</h2>
                        {remainingH && pct < 100 && (
                          <p style={{ fontSize: 13, color: SUB, margin: 0 }}>
                            Temps restant estimé : <strong style={{ color: BLUE }}>{remainingH}h</strong>
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: 26, fontWeight: 800, color: BLUE }}>{pct}%</span>
                    </div>
                    <div style={{ height: 10, background: BLUE_SOFT, borderRadius: 5, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: BLUE, borderRadius: 5 }} />
                    </div>
                  </div>
                )}

                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: INK, margin: "0 0 14px" }}>Votre parcours d'apprentissage</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    {features.map((f) => (
                      <div key={f.key} style={{ ...card, padding: 18, display: "flex", flexDirection: "column" }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: BLUE_SOFT, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                          <f.icon size={16} color={BLUE} />
                        </div>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: INK, marginBottom: 6 }}>{f.title}</div>
                        <p style={{ fontSize: 12, color: SUB, lineHeight: 1.5, margin: "0 0 14px", flex: 1 }}>{f.text}</p>
                        <Link
                          to={featureLink(f.key)}
                          className="btn-outline-hover"
                          style={{
                            textAlign: "center",
                            fontSize: 12.5,
                            fontWeight: 700,
                            padding: "9px",
                            borderRadius: 8,
                            background: f.primary ? INK : f.outline ? "#fff" : BLUE_SOFT,
                            color: f.primary ? "#fff" : f.outline ? INK : BLUE,
                            border: f.outline ? `1.5px solid ${BORDER}` : "none",
                          }}
                        >
                          {f.cta}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ ...card, background: BLUE_SOFT, border: `1px solid ${BLUE_SOFT}`, padding: 22 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: INK, margin: "0 0 14px" }}>Ce que vous allez apprendre</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {parcours.lecons.map((l) => (
                      <div key={l.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13.5, color: INK }}>
                        <Check size={16} color={BLUE} style={{ marginTop: 1, flexShrink: 0 }} />
                        {l.titre}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ ...card, padding: 22, textAlign: "center" }}>
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1.6",
                      borderRadius: 12,
                      background: isDone ? BLUE_SOFT : "#eef1f5",
                      border: `1.5px dashed ${isDone ? "#a9c3f5" : "#d3d9e0"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 14,
                    }}
                  >
                    {isDone ? <Award size={32} color={BLUE} /> : <Lock size={26} color="#9CA3AF" />}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: INK, margin: "0 0 6px" }}>Certification Finale</h3>
                  <p style={{ fontSize: 12.5, color: SUB, margin: "0 0 14px" }}>
                    {isDone
                      ? certificat
                        ? "Certificat déjà obtenu pour ce parcours."
                        : "Débloquez votre certificat officiel après validation."
                      : "Débloquez votre certificat officiel après validation à 100%."}
                  </p>
                  {isDone ? (
                    certificat ? (
                      <Link to={`/certificate/${certificat.id}`} className="landing-cta-primary" style={{ display: "block", color: "#fff", fontWeight: 700, fontSize: 13, padding: "11px", borderRadius: 9, border: "none" }}>
                        Voir le certificat
                      </Link>
                    ) : (
                      <button
                        onClick={handleObtenirCertificat}
                        disabled={issuing}
                        className="landing-cta-primary"
                        style={{ width: "100%", color: "#fff", fontWeight: 700, fontSize: 13, padding: "11px", borderRadius: 9, border: "none", opacity: issuing ? 0.7 : 1 }}
                      >
                        {issuing ? "…" : "Obtenir le certificat"}
                      </button>
                    )
                  ) : (
                    <button disabled style={{ width: "100%", background: BLUE_SOFT, color: "#9db3e0", fontWeight: 700, fontSize: 13, padding: "11px", borderRadius: 9, border: "none", cursor: "not-allowed" }}>
                      Voir le certificat
                    </button>
                  )}
                </div>
              </div>
            </div>

            {others.length > 0 && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: INK, margin: "0 0 16px" }}>Poursuivre votre exploration</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
                  {others.map((p) => (
                    <Link key={p.id} to={`/courses/${p.slug}`} className="landing-course-card" style={{ ...card, overflow: "hidden", display: "block" }}>
                      <div className="landing-course-img-wrap" style={{ height: 140, overflow: "hidden" }}>
                        <BigIllustration slug={p.slug} height={140} />
                      </div>
                      <div style={{ padding: 16 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 4 }}>{p.titre}</div>
                        <div style={{ fontSize: 12, color: SUB }}>Niveau {p.niveau}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
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
