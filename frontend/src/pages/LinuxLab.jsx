import { useEffect, useRef, useState } from "react";
import { getSession } from "../api";
import PlaygroundShell, { BLUE_SOFT, BLUE, BORDER } from "../components/PlaygroundShell";
import { logActivity } from "../utils/lmsStorage";

const PLAYGROUND_API_BASE = "http://localhost:8000/api/playground";
const USERNAME = "user";
const HOSTNAME = "fhamia";

export default function LinuxLab() {
  const session = getSession();
  const [cwd, setCwd] = useState("/home/user");
  const [lines, setLines] = useState([
    { type: "info", text: "Welcome to FhamIA Interactive Learning Environment v2.4.0" },
    { type: "info", text: "Starting Linux container session..." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  useEffect(() => {
    if (session) logActivity(session, { type: "playground", title: "Playground Linux", description: "Terminal Linux" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prompt = `${USERNAME}@${HOSTNAME}-vm:${cwd === "/home/user" ? "~" : cwd}$`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session || busy) return;
    const command = input;
    setInput("");

    if (!command.trim()) {
      setLines((prev) => [...prev, { type: "prompt", text: prompt, command: "" }]);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`${PLAYGROUND_API_BASE}/linux/run/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utilisateur: session.id, command, cwd }),
      });
      const result = await res.json();

      if (result.output === "__CLEAR__") {
        setLines([]);
        setCwd(result.cwd);
        return;
      }

      setCwd(result.cwd);
      setLines((prev) => [
        ...prev,
        { type: "prompt", text: prompt, command },
        ...(result.output ? [{ type: "output", text: result.output }] : []),
      ]);
    } catch {
      setLines((prev) => [
        ...prev,
        { type: "prompt", text: prompt, command },
        { type: "output", text: "Erreur : impossible de contacter le serveur. Vérifie que Django tourne." },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PlaygroundShell
      domainId="linux"
      parcours="Linux Essentials"
      progression="45%"
      tempsEstime="20 min"
      description="Expérimentez et mettez en pratique vos connaissances dans un environnement interactif."
      errorMessage="Connecte-toi pour utiliser le terminal — chaque utilisateur a son propre système de fichiers sauvegardé."
      instructions={{
        intro: "Dans cet exercice pratique, explorez le système de fichiers Linux. Utilisez le terminal ci-dessus pour naviguer entre les répertoires et manipuler des fichiers réels.",
        steps: [
          <>Listez le contenu du répertoire courant avec <code style={{ background: BLUE_SOFT, color: BLUE, padding: "2px 6px", borderRadius: 5 }}>ls</code></>,
          <>Créez un dossier avec <code style={{ background: BLUE_SOFT, color: BLUE, padding: "2px 6px", borderRadius: 5 }}>mkdir</code></>,
          <>Affichez un fichier avec <code style={{ background: BLUE_SOFT, color: BLUE, padding: "2px 6px", borderRadius: 5 }}>cat</code></>,
        ],
      }}
      tip={<>"Si vous êtes bloqué, essayez d'utiliser <strong style={{ color: BLUE }}>man [commande]</strong> pour obtenir de l'aide sur une commande spécifique."</>}
    >
      <div
        onClick={() => inputRef.current?.focus()}
        style={{ background: "#0a0e14", border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 50px -24px rgba(0,0,0,0.4)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#12161f" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff6159" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c941" }} />
          <span style={{ fontSize: 12, color: "#8891a5", marginLeft: 8, fontFamily: "var(--mono)" }}>user@fhamia-vm: ~</span>
        </div>
        <div style={{ padding: 20, fontFamily: "'Fira Code', Consolas, monospace", fontSize: 13, minHeight: 340, maxHeight: 440, overflowY: "auto" }}>
          {lines.map((line, i) =>
            line.type === "prompt" ? (
              <div key={i}>
                <span style={{ color: "#4ade80" }}>{line.text}</span>{" "}
                <span style={{ color: "#e6edf3" }}>{line.command}</span>
              </div>
            ) : (
              <pre key={i} style={{ margin: "2px 0 8px", color: line.type === "info" ? "#8891a5" : "#e6edf3", whiteSpace: "pre-wrap" }}>
                {line.text}
              </pre>
            )
          )}
          {session && (
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "#4ade80" }}>{prompt}</span>
              <input
                ref={inputRef}
                autoFocus
                disabled={busy}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e6edf3", fontFamily: "inherit", fontSize: "inherit" }}
              />
            </form>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </PlaygroundShell>
  );
}
