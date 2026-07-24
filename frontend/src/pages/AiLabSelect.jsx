import { Link } from "react-router-dom";
import { FlaskConical } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import FavoriteHeart from "../components/FavoriteHeart";
import { domainMeta } from "../data/domainCourses";

const labDescriptions = {
  linux: "Un vrai terminal simulé : tape ls, cd, pwd, cat… et explore un système de fichiers.",
  reseaux: "Un calculateur de sous-réseau réel : le serveur calcule adresse réseau, broadcast et plage d'hôtes.",
  bdd: "De vraies requêtes SQL exécutées sur ta propre base MySQL, sauvegardées côté serveur.",
  ia: "Un terrain d'essai LLM réel : teste un prompt sur un vrai modèle (Ollama) et ajuste ses paramètres.",
};

export default function AiLabSelect() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TopBar />
        <main style={{ padding: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: "var(--text-h)", margin: "0 0 6px" }}>
            AI Lab
          </h1>
          <div style={{ width: 46, height: 3, background: "var(--cyan)", borderRadius: 2, marginBottom: 14 }} />
          <p style={{ color: "var(--text-dim)", fontSize: 14, maxWidth: 560, margin: "0 0 28px" }}>
            Choisis un parcours pour ouvrir son terrain d'essai et pratiquer directement dans le navigateur.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {Object.entries(domainMeta).map(([id, meta]) => {
              const accentColor = meta.accent === "purple" ? "var(--purple)" : "var(--cyan)";
              return (
                <div
                  key={id}
                  style={{
                    position: "relative",
                    background: "var(--panel)",
                    border: "1px solid var(--panel-border)",
                    borderRadius: 14,
                    padding: 24,
                  }}
                >
                  <div style={{ position: "absolute", top: 14, right: 14 }}>
                    <FavoriteHeart
                      item={{
                        id: `playground-${id}`,
                        type: "playground",
                        title: `Playground ${meta.title}`,
                        subtitle: labDescriptions[id],
                        to: `/ai-lab/${id}`,
                      }}
                    />
                  </div>
                  <FlaskConical size={22} color={accentColor} />
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-h)", margin: "14px 0 8px" }}>
                    {meta.title}
                  </h2>
                  <p style={{ fontSize: 13, color: "var(--text-dim)", margin: "0 0 18px" }}>
                    {labDescriptions[id]}
                  </p>
                  <Link
                    to={`/ai-lab/${id}`}
                    style={{
                      display: "inline-block",
                      background: accentColor,
                      color: "#04141a",
                      fontWeight: 700,
                      fontSize: 13,
                      padding: "10px 18px",
                      borderRadius: 8,
                    }}
                  >
                    Tester
                  </Link>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
