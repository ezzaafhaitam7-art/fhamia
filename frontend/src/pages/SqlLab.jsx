import { useEffect, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { API_BASE, getSession } from "../api";
import PlaygroundShell, { BLUE, BLUE_SOFT, BORDER, INK, SUB } from "../components/PlaygroundShell";
import { logActivity } from "../utils/lmsStorage";

const PLAYGROUND_API_BASE = `${API_BASE}/playground`;
const STARTER_QUERY = "SELECT titre, annee FROM livres WHERE annee > 2019;";

export default function SqlLab() {
  const session = getSession();
  const [query, setQuery] = useState(STARTER_QUERY);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) logActivity(session, { type: "playground", title: "Playground SQL", description: "Bases de données" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runQuery = async () => {
    if (!session || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${PLAYGROUND_API_BASE}/sql/execute/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utilisateur: session.id, sql: query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");
      setResult(data);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setBusy(false);
    }
  };

  const resetSandbox = async () => {
    if (!session || busy) return;
    setBusy(true);
    try {
      await fetch(`${PLAYGROUND_API_BASE}/sql/reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utilisateur: session.id }),
      });
      setQuery(STARTER_QUERY);
      setResult(null);
      setError("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PlaygroundShell
      domainId="bdd"
      parcours="Bases de Données"
      progression="30%"
      tempsEstime="25 min"
      description="Expérimentez et mettez en pratique vos connaissances SQL dans un environnement interactif."
      errorMessage="Connecte-toi pour utiliser ta base — chaque utilisateur a sa propre base MySQL réelle et persistante."
      instructions={{
        intro: "Base MySQL réelle et personnelle (tables auteurs et livres pré-remplies). Tout ce que tu crées ou modifies est réellement sauvegardé côté serveur.",
        steps: [
          <>Sélectionnez des lignes avec <code style={{ background: BLUE_SOFT, color: BLUE, padding: "2px 6px", borderRadius: 5 }}>SELECT</code></>,
          <>Filtrez les résultats avec <code style={{ background: BLUE_SOFT, color: BLUE, padding: "2px 6px", borderRadius: 5 }}>WHERE</code></>,
          <>Réinitialisez votre base à tout moment avec le bouton dédié</>,
        ],
      }}
      tip={<>"Utilise <strong style={{ color: BLUE }}>JOIN</strong> pour combiner les tables auteurs et livres et explorer les relations entre elles."</>}
    >
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 50px -24px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${BORDER}`, background: "#fafbfc" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: 0.5 }}>Éditeur SQL</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={resetSandbox}
              disabled={!session || busy}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                border: `1px solid ${BORDER}`,
                color: INK,
                borderRadius: 20,
                padding: "8px 14px",
                fontSize: 12.5,
                fontWeight: 700,
                opacity: !session || busy ? 0.5 : 1,
                cursor: "pointer",
              }}
            >
              <RotateCcw size={14} /> Réinitialiser
            </button>
            <button
              onClick={runQuery}
              disabled={!session || busy}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: BLUE,
                border: "none",
                color: "#fff",
                borderRadius: 20,
                padding: "8px 18px",
                fontSize: 12.5,
                fontWeight: 700,
                opacity: !session || busy ? 0.5 : 1,
                cursor: "pointer",
              }}
            >
              <Play size={14} fill="#fff" /> {busy ? "Exécution…" : "Exécuter"}
            </button>
          </div>
        </div>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck={false}
          style={{
            width: "100%",
            height: 140,
            resize: "none",
            border: "none",
            outline: "none",
            background: "#0a0e14",
            color: "#e6edf3",
            fontFamily: "'Fira Code', Consolas, monospace",
            fontSize: 14,
            padding: 20,
            boxSizing: "border-box",
          }}
        />

        <div style={{ minHeight: 160, maxHeight: 320, overflow: "auto", padding: 20, borderTop: `1px solid ${BORDER}` }}>
          {error && <div style={{ color: "#ba1a1a", fontSize: 13, fontFamily: "monospace" }}>{error}</div>}

          {!error && result && result.columns.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {result.columns.map((col) => (
                    <th key={col} style={{ textAlign: "left", padding: "8px 12px", color: BLUE, borderBottom: `1px solid ${BORDER}` }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: "8px 12px", color: INK, borderBottom: `1px solid ${BORDER}` }}>
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!error && result && result.columns.length === 0 && (
            <div style={{ color: SUB, fontSize: 13 }}>
              Requête exécutée{result.affected !== undefined ? ` (${result.affected} ligne(s) affectée(s))` : ""}, aucun résultat à afficher.
            </div>
          )}

          {!error && !result && (
            <div style={{ color: SUB, fontSize: 13 }}>
              {session ? "Écris une requête puis clique sur Exécuter." : "Connecte-toi pour commencer."}
            </div>
          )}
        </div>
      </div>
    </PlaygroundShell>
  );
}
