import { useEffect, useRef, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, BookOpen, ZoomIn, ZoomOut } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { domainMeta } from "../data/domainCourses";
import { api } from "../api";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const BLUE = "#1A56DB";
const INK = "#191c1d";
const SUB = "#434654";
const BORDER = "#e5e7eb";
const PAGE_BG = "#f8f9fa";

function progressKey(domainId, courseId) {
  return `fhamia-progress-${domainId}-${courseId}`;
}

export default function Reader() {
  const { domainId, courseId } = useParams();
  const meta = domainMeta[domainId];

  const [lecon, setLecon] = useState(null);
  const [notFound, setNotFound] = useState(false);
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
      .then(setLecon)
      .catch(() => setNotFound(true));
  }, [courseId]);

  useEffect(() => {
    if (!lecon) return;
    const saved = Number(localStorage.getItem(progressKey(domainId, courseId)));
    if (!Number.isNaN(saved) && saved > 0) setPage(saved);
  }, [domainId, courseId, lecon]);

  useEffect(() => {
    if (!lecon) return;
    localStorage.setItem(progressKey(domainId, courseId), String(page));
  }, [page, domainId, courseId, lecon]);

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

    pdfRef.current.getPage(pageNum).then((pdfPage) => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const unscaled = pdfPage.getViewport({ scale: 1 });
      const fitScale = Math.min(
        (container.clientWidth - 4) / unscaled.width,
        (container.clientHeight - 4) / unscaled.height
      );
      const viewport = pdfPage.getViewport({ scale: fitScale * zoom });
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      pdfPage.render({ canvasContext: context, viewport });
    });

    return () => {
      cancelled = true;
    };
  }, [page, numPages, zoom]);

  if (!meta || notFound) return <Navigate to="/courses" replace />;

  return (
    <div style={{ height: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 32px",
          borderBottom: `1px solid ${BORDER}`,
          background: "#fff",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: BLUE }}>FhamIA</span>
          <Link to={`/courses/${domainId}/${courseId}`} style={{ fontSize: 12, color: SUB }}>
            ← Quitter la lecture
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: INK }}>
          <BookOpen size={16} color={BLUE} /> {lecon?.titre}
        </div>
        <div style={{ width: 90 }} />
      </nav>

      <main
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: zoom > 1 ? "flex-start" : "center",
          justifyContent: "center",
          padding: "16px 24px",
          overflow: "auto",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            borderRadius: 8,
            boxShadow: "0 8px 30px -12px rgba(0,0,0,0.2)",
          }}
        />
      </main>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, padding: "14px 24px", flexShrink: 0, background: "#fff", borderTop: `1px solid ${BORDER}` }}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: `1px solid ${BORDER}`,
            color: page === 1 ? "#c7ccd4" : INK,
            borderRadius: 8,
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: 600,
            opacity: page === 1 ? 0.5 : 1,
            cursor: page === 1 ? "default" : "pointer",
          }}
        >
          <ChevronLeft size={16} /> Page précédente
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: SUB }}>
          Page
          <input
            type="number"
            min={1}
            max={numPages || undefined}
            value={page}
            onChange={(e) => setPage(Math.max(1, Number(e.target.value) || 1))}
            style={{
              width: 56,
              background: PAGE_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              color: INK,
              textAlign: "center",
              padding: "6px 4px",
            }}
          />
          / {numPages || "…"}
        </div>

        <button
          onClick={() => setPage((p) => Math.min(numPages || p + 1, p + 1))}
          disabled={numPages != null && page >= numPages}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: BLUE,
            border: "none",
            color: "#fff",
            borderRadius: 8,
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: 700,
            opacity: numPages != null && page >= numPages ? 0.5 : 1,
          }}
        >
          Page suivante <ChevronRight size={16} />
        </button>

        <div style={{ width: 1, height: 24, background: BORDER }} />

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))}
            disabled={zoom <= 0.5}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: `1px solid ${BORDER}`,
              color: INK,
              borderRadius: 8,
              width: 34,
              height: 34,
              opacity: zoom <= 0.5 ? 0.5 : 1,
              cursor: zoom <= 0.5 ? "default" : "pointer",
            }}
          >
            <ZoomOut size={16} />
          </button>

          <span style={{ fontSize: 12, color: SUB, width: 42, textAlign: "center" }}>
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={() => setZoom((z) => Math.min(3, Math.round((z + 0.1) * 10) / 10))}
            disabled={zoom >= 3}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: `1px solid ${BORDER}`,
              color: INK,
              borderRadius: 8,
              width: 34,
              height: 34,
              opacity: zoom >= 3 ? 0.5 : 1,
              cursor: zoom >= 3 ? "default" : "pointer",
            }}
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
