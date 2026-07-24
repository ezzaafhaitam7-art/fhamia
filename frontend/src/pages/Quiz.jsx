import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, HelpCircle, FileText, Box, Terminal, MessageSquare } from "lucide-react";
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

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

const nextSteps = [
  { key: "back", icon: FileText, title: "Revenir au cours", text: "Consultez la partie théorique pour clarifier vos doutes.", cta: "Lire le cours" },
  { key: "playground", icon: Terminal, title: "Playground", text: "Pratiquez les commandes en temps réel dans un environnement sécurisé.", cta: "Pratiquer" },
  { key: "3d", icon: Box, title: "Visualisation 3D", text: "Explorez l'architecture système en immersion totale.", cta: "Lancer la 3D" },
  { key: "tutor", icon: MessageSquare, title: "Tuteur IA", text: "Posez une question en direct à votre assistant FhamIA.", cta: "Discuter" },
];

export default function Quiz() {
  const { domainId } = useParams();
  const meta = domainMeta[domainId];
  const session = getSession();

  const [quiz, setQuiz] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [confirmed, setConfirmed] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!domainId) return;
    api.get(`/quiz/quiz-by-slug/${domainId}/`).then(setQuiz).catch(() => setNotFound(true));
  }, [domainId]);

  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [finished]);

  if (!meta || notFound) return <Navigate to="/quiz" replace />;
  if (!quiz) return null;

  const total = quiz.questions.length;
  const q = quiz.questions[index];
  const selected = answers[index];
  const isConfirmed = confirmed[index];
  const confirmedCount = Object.keys(confirmed).length;
  const correctCount = Object.keys(confirmed).filter((i) => answers[i] === quiz.questions[i].reponse_correcte).length;
  const wrongCount = confirmedCount - correctCount;
  const accuracy = confirmedCount ? Math.round((correctCount / confirmedCount) * 100) : 100;

  const stepLink = (key) => {
    if (key === "back") return `/courses/${domainId}`;
    if (key === "playground") return `/ai-lab/${domainId}`;
    if (key === "3d") return `/visualisation/${domainId}`;
    return "/tutor";
  };

  const selectOption = (opt) => {
    if (isConfirmed) return;
    setAnswers((prev) => ({ ...prev, [index]: opt }));
  };

  const handleValidate = () => {
    if (!isConfirmed) {
      setConfirmed((prev) => ({ ...prev, [index]: true }));
      return;
    }
    if (index < total - 1) {
      setIndex((i) => i + 1);
    } else {
      setFinished(true);
      if (session) {
        const finalScore = Object.keys({ ...confirmed, [index]: true }).filter(
          (i) => answers[i] === quiz.questions[i].reponse_correcte
        ).length;
        api
          .post("/quiz/submit-progression/", {
            utilisateur: session.id,
            parcours: quiz.parcours_id,
            pourcentage: Math.round((finalScore / total) * 100),
            points: finalScore * 10,
          })
          .catch(() => {});
        logActivity(session, {
          type: "quiz",
          title: `Quiz ${meta.title}`,
          description: `${finalScore}/${total} bonnes réponses`,
        });
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit", display: "flex", flexDirection: "column" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: `1px solid ${BORDER}`, background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <BackButton to={`/courses/${domainId}`} />
          <span style={{ fontSize: 20, fontWeight: 700, color: BLUE }}>FhamIA</span>
        </div>
        <Link to="/profile" style={{ width: 34, height: 34, borderRadius: "50%", background: BLUE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
          {session ? `${session.prenom?.[0] || ""}${session.nom?.[0] || ""}` : "?"}
        </Link>
      </nav>

      <main style={{ width: "100%", padding: "24px 32px 60px", display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: SUB, textTransform: "uppercase" }}>
          <Link to="/dashboard" style={{ color: SUB }}>Accueil</Link> &gt; <Link to="/courses" style={{ color: SUB }}>Parcours</Link> &gt;{" "}
          <Link to={`/courses/${domainId}`} style={{ color: SUB }}>{meta.title}</Link> &gt; <span style={{ color: INK }}>Quiz</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 560 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px", color: BLUE }}>{quiz.titre}</h1>
            <p style={{ fontSize: 14, color: SUB, margin: 0 }}>Évaluez vos connaissances après avoir terminé le cours.</p>
          </div>
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "14px 20px", display: "flex", gap: 24 }}>
            <div>
              <div style={{ fontSize: 10.5, color: SUB, fontWeight: 700, textTransform: "uppercase" }}>Questions</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{total} Questions</div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: SUB, fontWeight: 700, textTransform: "uppercase" }}>Durée</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{formatTime(elapsed)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: SUB, fontWeight: 700, textTransform: "uppercase" }}>Progression</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: BLUE }}>{Math.round((confirmedCount / total) * 100)}%</div>
            </div>
          </div>
        </div>

        {finished ? (
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 40, textAlign: "center" }}>
            <CheckCircle2 size={40} color={BLUE} style={{ marginBottom: 12 }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, color: INK, margin: "0 0 8px" }}>Quiz terminé !</h2>
            <p style={{ fontSize: 15, color: SUB, margin: "0 0 20px" }}>
              Score final : <strong style={{ color: BLUE }}>{correctCount} / {total}</strong> ({accuracy}% de précision)
            </p>
            <Link to={`/courses/${domainId}`} className="landing-cta-primary" style={{ display: "inline-block", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 24px", borderRadius: 10 }}>
              Retour au parcours
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: BLUE }}>Question {index + 1} sur {total}</span>
                <span style={{ fontSize: 12.5, color: SUB }}>Précision actuelle : {accuracy}%</span>
              </div>
              <div style={{ height: 6, background: BORDER, borderRadius: 3, marginBottom: 20, overflow: "hidden" }}>
                <div style={{ width: `${(index / total) * 100}%`, height: "100%", background: BLUE, borderRadius: 3 }} />
              </div>

              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28 }}>
                <h2 style={{ fontSize: 19, fontWeight: 700, color: INK, margin: "0 0 22px", lineHeight: 1.4 }}>{q.enonce}</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {q.choix.map((opt, oi) => {
                    const isSelected = selected === opt;
                    const isCorrectOpt = opt === q.reponse_correcte;
                    let border = BORDER;
                    let bg = "#fff";
                    if (isConfirmed) {
                      if (isCorrectOpt) { border = "#22c55e"; bg = "#f0fdf4"; }
                      else if (isSelected) { border = "#ef4444"; bg = "#fef2f2"; }
                    } else if (isSelected) {
                      border = BLUE;
                      bg = BLUE_SOFT;
                    }
                    return (
                      <button
                        key={oi}
                        onClick={() => selectOption(opt)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                          padding: "14px 16px", borderRadius: 10, border: `1.5px solid ${border}`, background: bg,
                          fontSize: 14, color: INK, cursor: isConfirmed ? "default" : "pointer",
                        }}
                      >
                        <HelpCircle size={16} color={isSelected || (isConfirmed && isCorrectOpt) ? BLUE : "#9CA3AF"} />
                        {opt}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
                  <button
                    onClick={() => setIndex((i) => Math.max(0, i - 1))}
                    disabled={index === 0}
                    className="btn-outline-hover"
                    style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, color: index === 0 ? "#c7ccd4" : INK, background: "#fff", border: `1.5px solid ${BORDER}`, borderRadius: 10, padding: "10px 20px" }}
                  >
                    <ArrowLeft size={15} /> Précédent
                  </button>
                  <button
                    onClick={handleValidate}
                    disabled={!selected}
                    className="landing-cta-primary"
                    style={{ display: "flex", alignItems: "center", gap: 8, color: "#fff", fontWeight: 700, fontSize: 13.5, padding: "10px 22px", borderRadius: 10, border: "none", opacity: !selected ? 0.5 : 1 }}
                  >
                    {isConfirmed ? (index < total - 1 ? "Suivant" : "Terminer") : "Valider la réponse"} <CheckCircle2 size={15} />
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18 }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: SUB, textTransform: "uppercase", margin: "0 0 12px" }}>Statistiques du quiz</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: BLUE_SOFT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Mail size={15} color={BLUE} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{meta.title}</div>
                </div>
                {[
                  ["Bonnes réponses", correctCount, "#16a34a"],
                  ["Mauvaises réponses", wrongCount, "#dc2626"],
                  ["Temps écoulé", formatTime(elapsed), INK],
                  ["Questions restantes", total - confirmedCount, INK],
                ].map(([label, value, color]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "7px 0", borderTop: `1px solid ${BORDER}` }}>
                    <span style={{ color: SUB }}>{label}</span>
                    <span style={{ fontWeight: 700, color }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: BLUE_SOFT, borderRadius: 14, padding: 18 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: INK, margin: "0 0 8px" }}>Besoin d'aide ?</h3>
                <p style={{ fontSize: 12.5, color: SUB, lineHeight: 1.6, margin: "0 0 10px" }}>
                  Consultez le cours pour revoir les notions abordées dans cette question.
                </p>
                <Link to={`/courses/${domainId}`} style={{ fontSize: 12.5, fontWeight: 700, color: BLUE }}>
                  Voir le cours →
                </Link>
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: INK, margin: "8px 0 18px" }}>Étape suivante</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {nextSteps.map((s) => (
              <div key={s.key} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: BLUE_SOFT, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <s.icon size={16} color={BLUE} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: INK, marginBottom: 6 }}>{s.title}</div>
                <p style={{ fontSize: 12, color: SUB, lineHeight: 1.5, margin: "0 0 14px" }}>{s.text}</p>
                <Link to={stepLink(s.key)} className="btn-outline-hover" style={{ display: "block", textAlign: "center", fontSize: 12.5, fontWeight: 700, padding: "9px", borderRadius: 20, border: `1.5px solid ${BLUE}`, color: BLUE }}>
                  {s.cta}
                </Link>
              </div>
            ))}
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
