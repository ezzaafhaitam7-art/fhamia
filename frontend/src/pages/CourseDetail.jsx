import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  Menu,
  Clock,
  Layers3,
  Download,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ArrowRight,
  Box,
  Terminal,
  ClipboardCheck,
  MessageSquare,
} from "lucide-react";
import { domainMeta } from "../data/domainCourses";
import { api, getSession } from "../api";
import BackButton from "../components/BackButton";
import FavoriteHeart from "../components/FavoriteHeart";
import { logActivity } from "../utils/lmsStorage";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const BLUE = "#1A56DB";
const BLUE_SOFT = "#EBF5FF";
const INK = "#191c1d";
const SUB = "#434654";
const BORDER = "#e5e7eb";
const PAGE_BG = "#f8f9fa";

const features = [
  { key: "3d", icon: Box, title: "Visualisation 3D", text: "Explorez l'architecture système à travers une interface immersive interactive.", cta: "Explorer" },
  { key: "playground", icon: Terminal, title: "Playground", text: "Exécutez vos premières commandes dans un environnement sécurisé en temps réel.", cta: "Pratiquer" },
  { key: "quiz", icon: ClipboardCheck, title: "Quiz Adaptatif", text: "Vérifiez vos acquis avec une série de questions selon votre progression.", cta: "Commencer" },
  { key: "tutor", icon: MessageSquare, title: "Tuteur IA", text: "Posez vos questions complexes à notre assistant spécialisé.", cta: "Discuter" },
];

export default function CourseDetail() {
  const { domainId, courseId } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const meta = domainMeta[domainId];

  const [lecon, setLecon] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pdfRef = useRef(null);

  useEffect(() => {
    if (!courseId) return;
    api
      .get(`/courses/lecons/${courseId}/`)
      .then((data) => {
        setLecon(data);
        logActivity(session, {
          type: "cours",
          title: `Consultation du cours ${data.titre}`,
          description: meta?.title,
        });
      })
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    if (!meta) return;
    let cancelled = false;
    pdfjsLib.getDocument({ url: meta.book, cMapUrl: "/cmaps/", cMapPacked: true }).promise.then((pdf) => {
      if (cancelled) return;
      pdfRef.current = pdf;
      setNumPages(pdf.numPages);
    });
    return () => {
      cancelled = true;
    };
  }, [meta]);

  useEffect(() => {
    if (!pdfRef.current || !numPages) return;
    const pageNum = Math.min(Math.max(1, page), numPages);
    let cancelled = false;
    let renderTask = null;

    pdfRef.current.getPage(pageNum).then((pdfPage) => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const unscaled = pdfPage.getViewport({ scale: 1 });
      const fitScale = (container.clientWidth - 4) / unscaled.width;
      const viewport = pdfPage.getViewport({ scale: fitScale * zoom });
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      renderTask = pdfPage.render({ canvasContext: context, viewport });
      renderTask.promise.catch((err) => {
        if (err?.name !== "RenderingCancelledException") console.error(err);
      });
    });

    return () => {
      cancelled = true;
      if (renderTask) renderTask.cancel();
    };
  }, [page, numPages, zoom]);

  if (error || !meta) return <Navigate to={`/courses/${domainId}`} replace />;

  const paragraphes = lecon ? lecon.contenu.split("\n\n").filter(Boolean) : [];

  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: `1px solid ${BORDER}`, background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <BackButton to={`/courses/${domainId}`} />
          <Menu size={20} color={INK} />
          <span style={{ fontSize: 20, fontWeight: 700, color: BLUE }}>FhamIA</span>
        </div>
        <Link to="/profile" style={{ width: 34, height: 34, borderRadius: "50%", background: BLUE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
          {session ? `${session.prenom?.[0] || ""}${session.nom?.[0] || ""}` : "?"}
        </Link>
      </nav>

      <main style={{ width: "100%", padding: "24px 32px 60px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: SUB, textTransform: "uppercase" }}>
          <Link to="/dashboard" style={{ color: SUB }}>Accueil</Link> &gt; <Link to="/courses" style={{ color: SUB }}>Parcours</Link> &gt;{" "}
          <Link to={`/courses/${domainId}`} style={{ color: SUB }}>{meta.title}</Link> &gt; <span style={{ color: INK }}>Cours</span>
        </div>

        {!lecon ? (
          <p style={{ color: SUB, fontSize: 14 }}>Chargement…</p>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
              <div style={{ maxWidth: 560 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: INK }}>{lecon.titre}</h1>
                  <FavoriteHeart
                    item={{
                      id: `cours-${courseId}`,
                      type: "cours",
                      title: lecon.titre,
                      subtitle: meta.title,
                      to: `/courses/${domainId}/${courseId}`,
                    }}
                    style={{ position: "static", boxShadow: "none", background: BLUE_SOFT }}
                  />
                </div>
                <p style={{ fontSize: 14, color: SUB, lineHeight: 1.6, margin: "0 0 12px" }}>
                  {paragraphes[0]?.slice(0, 160) || `Contenu du module ${lecon.titre}.`}
                </p>
                <div style={{ display: "flex", gap: 18, fontSize: 13, color: SUB }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={14} color={BLUE} /> {lecon.duree} min</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Layers3 size={14} color={BLUE} /> {paragraphes.length} sections</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <a href={meta.book} download className="btn-outline-hover" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: INK, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 16px", background: "#fff" }}>
                  <Download size={15} /> Télécharger
                </a>
                <button
                  onClick={() => navigate(`/learn/${domainId}/${courseId}`)}
                  className="btn-outline-hover"
                  style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: INK, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 16px", background: "#fff", cursor: "pointer" }}
                >
                  <Maximize2 size={15} /> Plein écran
                </button>
              </div>
            </div>

            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: `1px solid ${BORDER}` }}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="icon-btn-hover" style={{ background: "none", border: "none", color: page === 1 ? "#c7ccd4" : INK, display: "flex", alignItems: "center", gap: 4, fontSize: 13, cursor: page === 1 ? "default" : "pointer" }}>
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: 13, color: SUB }}>Page {page} / {numPages || "…"}</span>
                <button onClick={() => setPage((p) => Math.min(numPages || p + 1, p + 1))} disabled={numPages != null && page >= numPages} className="icon-btn-hover" style={{ background: "none", border: "none", color: numPages != null && page >= numPages ? "#c7ccd4" : INK, display: "flex", alignItems: "center", gap: 4, fontSize: 13, cursor: "pointer" }}>
                  <ChevronRight size={16} />
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 20 }}>
                  <button onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))} className="icon-btn-hover" style={{ background: "none", border: "none", color: INK, cursor: "pointer", display: "flex" }}>
                    <ZoomOut size={16} />
                  </button>
                  <span style={{ fontSize: 12, color: SUB, width: 38, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom((z) => Math.min(2.5, Math.round((z + 0.1) * 10) / 10))} className="icon-btn-hover" style={{ background: "none", border: "none", color: INK, cursor: "pointer", display: "flex" }}>
                    <ZoomIn size={16} />
                  </button>
                </div>
              </div>
              <div ref={containerRef} style={{ padding: 24, display: "flex", justifyContent: "center", background: PAGE_BG, overflow: "auto", maxHeight: "85vh" }}>
                <canvas ref={canvasRef} style={{ borderRadius: 8, boxShadow: "0 8px 30px -12px rgba(0,0,0,0.2)" }} />
              </div>
            </div>

            <div style={{ background: BLUE, borderRadius: 16, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Vous avez terminé cette lecture ?</h2>
                <p style={{ fontSize: 13, color: "#dce6fb", margin: 0 }}>Mettez vos connaissances en pratique ou approfondissez les concepts avec nos outils IA.</p>
              </div>
              <Link to={`/quiz/${domainId}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: BLUE, fontWeight: 700, fontSize: 14, padding: "12px 22px", borderRadius: 10 }}>
                Passer à l'étape suivante <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {features.map((f) => {
                const href = f.key === "3d" ? `/visualisation/${domainId}` : f.key === "playground" ? `/ai-lab/${domainId}` : f.key === "quiz" ? `/quiz/${domainId}` : "/tutor";
                return (
                  <div key={f.key} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18, display: "flex", flexDirection: "column" }}>
                    <div style={{ width: 60, height: 60, borderRadius: 10, background: BLUE_SOFT, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                      <f.icon size={26} color={BLUE} />
                    </div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: INK, marginBottom: 6 }}>{f.title}</div>
                    <p style={{ fontSize: 12, color: SUB, lineHeight: 1.5, margin: "0 0 16px", flex: 1 }}>{f.text}</p>
                    <Link to={href} className="btn-outline-hover" style={{ textAlign: "center", fontSize: 12.5, fontWeight: 700, padding: "9px", borderRadius: 8, border: `1.5px solid ${BLUE}`, color: BLUE }}>
                      {f.cta}
                    </Link>
                  </div>
                );
              })}
            </div>
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
