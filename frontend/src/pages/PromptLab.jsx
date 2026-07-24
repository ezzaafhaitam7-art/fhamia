import { useEffect, useState } from "react";
import { Sparkle } from "lucide-react";
import PlaygroundShell, { BLUE, BLUE_SOFT, BORDER, INK, SUB } from "../components/PlaygroundShell";
import { getSession } from "../api";
import { logActivity } from "../utils/lmsStorage";

const RAG_API_BASE = "http://localhost:8000/api/rag";

export default function PromptLab() {
  const [prompt, setPrompt] = useState("Explique-moi ce qu'est un réseau de neurones, en une phrase simple.");
  const [temperature, setTemperature] = useState(0.7);
  const [numPredict, setNumPredict] = useState(200);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) logActivity(session, { type: "playground", title: "Playground IA", description: "Prompt engineering" });
  }, []);

  const run = async () => {
    if (!prompt.trim()) return;
    setBusy(true);
    setError("");
    setResponse("");
    try {
      const res = await fetch(`${RAG_API_BASE}/prompt-stream/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, temperature: Number(temperature), num_predict: Number(numPredict) }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur inconnue");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setResponse(text);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PlaygroundShell
      domainId="ia"
      parcours="Intelligence Artificielle"
      progression="10%"
      tempsEstime="15 min"
      description="Expérimentez et mettez en pratique le prompt engineering dans un environnement interactif."
      instructions={{
        intro: "Terrain d'essai LLM réel : écris un prompt, ajuste les paramètres, et observe comment un vrai modèle de langage (Ollama) réagit.",
        steps: [
          <>Rédigez votre prompt puis cliquez sur <code style={{ background: BLUE_SOFT, color: BLUE, padding: "2px 6px", borderRadius: 5 }}>Envoyer au modèle</code></>,
          <>Ajustez la <code style={{ background: BLUE_SOFT, color: BLUE, padding: "2px 6px", borderRadius: 5 }}>Température</code> pour varier la créativité</>,
          <>Limitez la longueur de la réponse avec le curseur de tokens</>,
        ],
      }}
      tip={<>"Une <strong style={{ color: BLUE }}>température basse</strong> (proche de 0) donne des réponses stables et factuelles, idéales pour tester la précision d'un prompt."</>}
    >
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, boxShadow: "0 20px 50px -24px rgba(0,0,0,0.15)" }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{
            width: "100%",
            height: 120,
            resize: "vertical",
            background: BLUE_SOFT,
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            padding: 14,
            color: INK,
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box",
            marginBottom: 16,
          }}
        />

        <div style={{ display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase" }}>
              Température : {temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              style={{ width: "100%" }}
            />
            <div style={{ fontSize: 11, color: SUB }}>
              Bas = réponses prévisibles &middot; Haut = réponses plus créatives/aléatoires
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase" }}>
              Longueur max (tokens) : {numPredict}
            </label>
            <input
              type="range"
              min="50"
              max="500"
              step="50"
              value={numPredict}
              onChange={(e) => setNumPredict(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <button
          onClick={run}
          disabled={busy || !prompt.trim()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: BLUE,
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            border: "none",
            borderRadius: 20,
            padding: "12px 24px",
            opacity: busy || !prompt.trim() ? 0.6 : 1,
            marginBottom: 20,
            cursor: "pointer",
          }}
        >
          <Sparkle size={16} /> {busy ? "Génération en cours…" : "Envoyer au modèle"}
        </button>

        {error && <p style={{ color: "#ba1a1a", fontSize: 13 }}>{error}</p>}

        {response && (
          <div style={{ background: BLUE_SOFT, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, color: BLUE, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>
              Réponse du modèle
            </div>
            <p style={{ fontSize: 14, color: INK, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
              {response}
            </p>
          </div>
        )}
      </div>
    </PlaygroundShell>
  );
}
