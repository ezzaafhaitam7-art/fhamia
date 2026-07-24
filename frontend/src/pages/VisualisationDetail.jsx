import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  Maximize2,
  Minimize2,
  Info,
  Lightbulb,
  ArrowLeft,
  Terminal,
  ClipboardCheck,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { domainMeta } from "../data/domainCourses";
import { visualisations } from "../data/visualisations";
import FileTreeScene from "../components/visualizations/FileTreeScene";
import OsiTowerScene from "../components/visualizations/OsiTowerScene";
import RelationalCityScene from "../components/visualizations/RelationalCityScene";
import NeuralNetworkScene from "../components/visualizations/NeuralNetworkScene";
import { api, getSession } from "../api";
import BackButton from "../components/BackButton";
import { logActivity } from "../utils/lmsStorage";

const BLUE = "#1A56DB";
const BLUE_SOFT = "#EBF5FF";
const INK = "#191c1d";
const SUB = "#434654";
const BORDER = "#e5e7eb";
const PAGE_BG = "#f8f9fa";

const SCENES = {
  linux: FileTreeScene,
  reseaux: OsiTowerScene,
  bdd: RelationalCityScene,
  ia: NeuralNetworkScene,
};

const stepFeatures = [
  { key: "back", icon: ArrowLeft, title: "Retour au cours", text: "Reprenez la lecture théorique là où vous vous êtes arrêté.", cta: "Continuer" },
  { key: "playground", icon: Terminal, title: "Playground", text: "Pratiquez les commandes en temps réel dans un terminal sécurisé.", cta: "Lancer", primary: true },
  { key: "quiz", icon: ClipboardCheck, title: "Quiz", text: "Testez vos connaissances sur l'architecture système.", cta: "Démarrer" },
  { key: "tutor", icon: MessageSquare, title: "Tuteur IA", text: "Posez vos questions complexes à notre assistant pédagogique.", cta: "Discuter" },
];

export default function VisualisationDetail() {
  const { domainId } = useParams();
  const session = getSession();
  const meta = domainMeta[domainId];
  const items = visualisations[domainId];
  const Scene = SCENES[domainId];

  const [parcours, setParcours] = useState(null);
  const [progressions, setProgressions] = useState([]);
  const [firstLeconId, setFirstLeconId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sceneWrapperRef = useRef(null);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    if (session && meta) logActivity(session, { type: "visualisation", title: `Visualisation 3D ${meta.title}`, description: meta.title });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainId]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      sceneWrapperRef.current?.requestFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    if (!domainId) return;
    api.get(`/courses/parcours/${domainId}/`).then((p) => {
      setParcours(p);
      setFirstLeconId(p.lecons?.[0]?.id || null);
    }).catch(() => {});
    if (session) {
      api.get("/quiz/progressions/").then((progs) => {
        setProgressions(progs.filter((pr) => pr.utilisateur === session.id));
      }).catch(() => {});
    }
  }, [domainId]);

  if (!meta || !items) return <Navigate to="/visualisation" replace />;

  const progression = parcours ? progressions.find((p) => p.parcours === parcours.id) : null;
  const pct = progression ? Math.round(progression.pourcentage) : 0;

  const featureLink = (key) => {
    if (key === "back") return firstLeconId ? `/courses/${domainId}/${firstLeconId}` : `/courses/${domainId}`;
    if (key === "playground") return `/ai-lab/${domainId}`;
    if (key === "quiz") return `/quiz/${domainId}`;
    return "/tutor";
  };

  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: `1px solid ${BORDER}`, background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <BackButton to={`/courses/${domainId}`} />
          <span style={{ fontSize: 20, fontWeight: 700, color: BLUE }}>FhamIA</span>
        </div>
        <Link to="/profile" style={{ width: 34, height: 34, borderRadius: "50%", background: BLUE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
          {session ? `${session.prenom?.[0] || ""}${session.nom?.[0] || ""}` : "?"}
        </Link>
      </nav>

      <main style={{ width: "100%", padding: "24px 32px 60px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: SUB, textTransform: "uppercase" }}>
          <Link to="/dashboard" style={{ color: SUB }}>Accueil</Link> &gt; <Link to="/courses" style={{ color: SUB }}>Parcours</Link> &gt;{" "}
          <Link to={`/courses/${domainId}`} style={{ color: SUB }}>{meta.title}</Link> &gt; <span style={{ color: INK }}>Visualisation 3D</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 560 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px", color: INK }}>Visualisation interactive</h1>
            <p style={{ fontSize: 14, color: SUB, margin: 0, lineHeight: 1.6 }}>
              Manipulez cette visualisation pour mieux comprendre les concepts étudiés dans le cours {meta.title}.
            </p>
          </div>
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "14px 20px", minWidth: 220 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 20, fontSize: 11.5, marginBottom: 8 }}>
              <span style={{ color: SUB, fontWeight: 700, textTransform: "uppercase" }}>Parcours</span>
              <Link to={`/courses/${domainId}`} style={{ color: BLUE, fontWeight: 700 }}>{parcours?.titre || meta.title}</Link>
            </div>
            {session && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                  <span style={{ color: SUB, fontWeight: 700, textTransform: "uppercase" }}>Progression</span>
                  <span style={{ color: BLUE, fontWeight: 700 }}>{pct}%</span>
                </div>
                <div style={{ height: 5, background: BLUE_SOFT, borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: BLUE, borderRadius: 3 }} />
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "12px 18px", borderBottom: `1px solid ${BORDER}` }}>
            <button
              onClick={toggleFullscreen}
              className="icon-btn-hover"
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: INK, background: "none", border: "none", cursor: "pointer" }}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />} Plein écran
            </button>
          </div>

          {Scene && (
            <div ref={sceneWrapperRef} style={{ position: "relative", background: "#fff" }}>
              <div className="scene-3d" style={{ width: "100%", height: isFullscreen ? "100vh" : 480 }}>
                <Scene accentColor={BLUE} />
              </div>
              {isFullscreen && (
                <button
                  onClick={toggleFullscreen}
                  style={{ position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center", gap: 6, background: "#fff", border: `1px solid ${BORDER}`, color: INK, borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  <Minimize2 size={15} /> Quitter le plein écran
                </button>
              )}
              <div style={{ position: "absolute", bottom: 16, right: 16, display: "flex", alignItems: "center", gap: 10, background: BLUE, color: "#fff", borderRadius: 12, padding: "10px 16px", maxWidth: 300, fontSize: 12.5, boxShadow: "0 10px 24px -10px rgba(26,86,219,0.5)" }}>
                <Lightbulb size={16} style={{ flexShrink: 0 }} />
                Manipulez la visualisation avec votre souris afin d'observer le concept sous différents angles.
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: BLUE_SOFT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Info size={17} color={BLUE} />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: INK, margin: 0 }}>Comprendre cette visualisation</h2>
            </div>
            <p style={{ fontSize: 13.5, color: SUB, lineHeight: 1.7, margin: 0 }}>
              {items[0]?.description} Explorez librement la scène pour observer comment les différents éléments interagissent entre eux.
            </p>
          </div>

          <div style={{ background: BLUE_SOFT, borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: BLUE, margin: "0 0 14px" }}>Points clés à observer :</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((it) => (
                <div key={it.titre} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: INK }}>
                  <CheckCircle2 size={16} color={BLUE} style={{ flexShrink: 0, marginTop: 1 }} />
                  {it.titre}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: INK, textAlign: "center", margin: "0 0 18px" }}>Étape suivante</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {stepFeatures.map((f) => (
              <div key={f.key} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: BLUE_SOFT, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <f.icon size={20} color={BLUE} />
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: INK, marginBottom: 6 }}>{f.title}</div>
                <p style={{ fontSize: 12, color: SUB, lineHeight: 1.5, margin: "0 0 16px", flex: 1 }}>{f.text}</p>
                <Link
                  to={featureLink(f.key)}
                  className={f.primary ? "landing-cta-primary" : "btn-outline-hover"}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    textAlign: "center",
                    fontSize: 12.5,
                    fontWeight: 700,
                    padding: "10px",
                    borderRadius: 8,
                    background: f.primary ? undefined : BLUE_SOFT,
                    color: f.primary ? "#fff" : BLUE,
                    border: f.primary ? "none" : `1.5px solid ${BLUE_SOFT}`,
                  }}
                >
                  {f.cta}
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
