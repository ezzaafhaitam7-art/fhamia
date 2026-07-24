import { useEffect, useState } from "react";
import { Calculator } from "lucide-react";
import PlaygroundShell, { BLUE, BLUE_SOFT, BORDER, INK, SUB } from "../components/PlaygroundShell";
import { getSession } from "../api";
import { logActivity } from "../utils/lmsStorage";

const PLAYGROUND_API_BASE = "http://localhost:8000/api/playground";

const FIELDS = [
  { key: "adresse_reseau", label: "Adresse réseau" },
  { key: "masque", label: "Masque" },
  { key: "adresse_broadcast", label: "Adresse de broadcast" },
  { key: "premiere_adresse_utilisable", label: "Première adresse utilisable" },
  { key: "derniere_adresse_utilisable", label: "Dernière adresse utilisable" },
  { key: "nombre_hotes_utilisables", label: "Nombre d'hôtes utilisables" },
  { key: "nombre_adresses_totales", label: "Nombre d'adresses totales" },
];

export default function SubnetLab() {
  const [cidr, setCidr] = useState("192.168.1.10/26");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) logActivity(session, { type: "playground", title: "Playground Réseaux", description: "Calculateur de sous-réseau" });
  }, []);

  const calculate = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${PLAYGROUND_API_BASE}/reseaux/subnet/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cidr }),
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

  return (
    <PlaygroundShell
      domainId="reseaux"
      parcours="Réseaux & Protocoles"
      progression="60%"
      tempsEstime="15 min"
      description="Expérimentez et mettez en pratique le calcul de sous-réseaux dans un environnement interactif."
      instructions={{
        intro: "Calculateur de sous-réseau réel : entre une adresse IP au format CIDR, le serveur calcule les vraies valeurs (adresse réseau, broadcast, plage d'hôtes...).",
        steps: [
          <>Entrez une adresse au format <code style={{ background: BLUE_SOFT, color: BLUE, padding: "2px 6px", borderRadius: 5 }}>IP/CIDR</code></>,
          <>Cliquez sur <code style={{ background: BLUE_SOFT, color: BLUE, padding: "2px 6px", borderRadius: 5 }}>Calculer</code> pour obtenir les résultats</>,
          <>Comparez la plage d'hôtes utilisables et le masque obtenus</>,
        ],
      }}
      tip={<>"Un préfixe plus grand (ex: <strong style={{ color: BLUE }}>/28</strong>) réduit le nombre d'hôtes disponibles mais augmente le nombre de sous-réseaux possibles."</>}
    >
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, boxShadow: "0 20px 50px -24px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input
            value={cidr}
            onChange={(e) => setCidr(e.target.value)}
            placeholder="192.168.1.10/26"
            style={{
              flex: 1,
              background: BLUE_SOFT,
              border: `1px solid ${BORDER}`,
              borderRadius: 10,
              padding: "12px 14px",
              color: INK,
              fontSize: 14,
              fontFamily: "monospace",
              outline: "none",
            }}
          />
          <button
            onClick={calculate}
            disabled={busy}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: BLUE,
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              border: "none",
              borderRadius: 10,
              padding: "0 22px",
              opacity: busy ? 0.6 : 1,
              cursor: "pointer",
            }}
          >
            <Calculator size={15} /> {busy ? "Calcul…" : "Calculer"}
          </button>
        </div>

        {error && <p style={{ color: "#ba1a1a", fontSize: 13, marginBottom: 20 }}>{error}</p>}

        {result && (
          <div style={{ background: BLUE_SOFT, borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 12, color: BLUE, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {result.notation_cidr}
            </div>
            {FIELDS.map((f) => (
              <div key={f.key} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: SUB }}>{f.label}</span>
                <span style={{ color: INK, fontFamily: "monospace", fontWeight: 600 }}>{result[f.key]}</span>
              </div>
            ))}
          </div>
        )}

        {!result && !error && (
          <div style={{ color: SUB, fontSize: 13 }}>Entrez une adresse IP au format CIDR puis cliquez sur Calculer.</div>
        )}
      </div>
    </PlaygroundShell>
  );
}
