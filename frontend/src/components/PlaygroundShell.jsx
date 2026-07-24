import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Info, FileText, Box, ClipboardCheck, MessageSquare, CheckCircle2, Clock3 } from "lucide-react";
import { getSession } from "../api";
import BackButton from "./BackButton";

export const BLUE = "#1A56DB";
export const BLUE_SOFT = "#EBF5FF";
export const INK = "#191c1d";
export const SUB = "#434654";
export const BORDER = "#e5e7eb";
export const PAGE_BG = "#f8f9fa";

export default function PlaygroundShell({
  domainId,
  parcours,
  progression,
  tempsEstime,
  description,
  instructions,
  tip,
  errorMessage,
  children,
}) {
  const session = getSession();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/courses?search=${encodeURIComponent(search.trim())}`);
  };

  const nextSteps = [
    { icon: FileText, title: "Revenir au cours", text: "Consultez la partie théorique pour clarifier vos doutes.", cta: "Lire le cours", to: `/courses/${domainId}` },
    { icon: Box, title: "Visualisation 3D", text: "Explorez l'architecture système en immersion totale.", cta: "Lancer la 3D", to: `/visualisation/${domainId}` },
    { icon: ClipboardCheck, title: "Quiz rapide", text: "Testez vos connaissances acquises lors de cette session.", cta: "Démarrer", to: `/quiz/${domainId}` },
    { icon: MessageSquare, title: "Tuteur IA", text: "Posez une question en direct à votre assistant FhamIA.", cta: "Discuter", to: "/tutor" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderBottom: `1px solid ${BORDER}`, background: "#fff", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <BackButton to={`/courses/${domainId}`} />
          <span style={{ fontSize: 20, fontWeight: 700, color: BLUE }}>FhamIA</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f1f3f9", borderRadius: 20, padding: "8px 16px", width: 220 }}>
            <Search size={15} color={SUB} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, color: INK, width: "100%" }}
            />
          </form>
          <Link to="/profile" style={{ width: 34, height: 34, borderRadius: "50%", background: BLUE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
            {session ? `${session.prenom?.[0] || ""}${session.nom?.[0] || ""}` : "?"}
          </Link>
        </div>
      </nav>

      <main style={{ width: "100%", padding: "24px 32px 60px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: SUB, textTransform: "uppercase" }}>
          <Link to="/dashboard" style={{ color: SUB }}>Accueil</Link> &gt; <Link to="/courses" style={{ color: SUB }}>Parcours</Link> &gt; <span style={{ color: INK }}>Playground</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 8px", color: BLUE }}>Playground</h1>
            <p style={{ fontSize: 14, color: SUB, margin: 0, lineHeight: 1.6, maxWidth: 560 }}>{description}</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 0, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px 22px", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
            <div style={{ paddingRight: 22, borderRight: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: SUB, textTransform: "uppercase", marginBottom: 4 }}>Parcours</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{parcours}</div>
            </div>
            <div style={{ padding: "0 22px", borderRight: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: SUB, textTransform: "uppercase", marginBottom: 4 }}>Progression</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: BLUE }}>{progression}</div>
            </div>
            <div style={{ paddingLeft: 22 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: SUB, textTransform: "uppercase", marginBottom: 4 }}>Temps estimé</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, display: "flex", alignItems: "center", gap: 5 }}>
                <Clock3 size={13} color={BLUE} /> {tempsEstime}
              </div>
            </div>
          </div>
        </div>

        {!session && errorMessage && (
          <p style={{ fontSize: 13, color: "#ba1a1a" }}>{errorMessage}</p>
        )}

        {children}

        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Info size={19} color={BLUE} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: INK, margin: 0 }}>Instructions</h2>
            </div>
            <p style={{ fontSize: 13.5, color: SUB, lineHeight: 1.6, margin: "0 0 12px" }}>{instructions.intro}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: INK }}>
              {instructions.steps.map((step, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 size={16} color={BLUE} /> {step}
                </span>
              ))}
            </div>
          </div>
          <div style={{ background: BLUE_SOFT, borderRadius: 12, padding: 18 }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: "0 0 8px" }}>Conseil de l'IA</h3>
            <p style={{ fontSize: 13, color: SUB, fontStyle: "italic", lineHeight: 1.6, margin: 0 }}>{tip}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {nextSteps.map((s) => (
            <div key={s.title} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: BLUE_SOFT, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <s.icon size={16} color={BLUE} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: INK, marginBottom: 6 }}>{s.title}</div>
              <p style={{ fontSize: 12, color: SUB, lineHeight: 1.5, margin: "0 0 14px" }}>{s.text}</p>
              <Link to={s.to} className="btn-outline-hover" style={{ display: "block", textAlign: "center", fontSize: 12.5, fontWeight: 700, padding: "9px", borderRadius: 20, border: `1.5px solid ${BLUE}`, color: BLUE }}>
                {s.cta}
              </Link>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${BORDER}`, background: "#fff", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 12, color: SUB }}>
          <strong style={{ color: INK }}>FhamIA</strong> &middot; &copy; 2026 FhamIA. Tous droits réservés.
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 12, color: SUB }}>
          <span>Privacy Policy</span>
          <Link to="/terms" style={{ color: SUB }}>Terms of Service</Link>
          <Link to="/support" style={{ color: SUB }}>Help Center</Link>
          <span>Accessibility</span>
        </div>
      </footer>
    </div>
  );
}
