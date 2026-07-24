import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";

const AUTEURS = [
  { id: 1, nom: "Fatima Zahra" },
  { id: 2, nom: "Ahmed Bensouda" },
  { id: 3, nom: "Leïla Amrani" },
];

const LIVRES = [
  { id: 1, titre: "Introduction au SQL", auteur_id: 1 },
  { id: 2, titre: "Bases de Données Relationnelles", auteur_id: 1 },
  { id: 3, titre: "Le Web Moderne", auteur_id: 2 },
  { id: 4, titre: "Intelligence Artificielle Appliquée", auteur_id: 3 },
];

const AUTEURS_X = -3.6;
const LIVRES_X = 3.6;
const ROW_HEIGHT = 0.85;

function rowY(index, total) {
  return ((total - 1) / 2 - index) * ROW_HEIGHT;
}

function Row({ x, y, label, highlighted, accentColor }) {
  return (
    <group position={[x, y, 0]}>
      <mesh>
        <boxGeometry args={[3.1, 0.62, 0.12]} />
        <meshStandardMaterial
          color={highlighted ? accentColor : "#1a2138"}
          emissive={highlighted ? accentColor : "#000"}
          emissiveIntensity={highlighted ? 0.5 : 0}
        />
      </mesh>
      <Text position={[0, 0, 0.1]} fontSize={0.21} color={highlighted ? "#04141a" : "#e6edf3"} anchorX="center" anchorY="middle" maxWidth={2.8}>
        {label}
      </Text>
    </group>
  );
}

function Particle({ from, to, progress }) {
  if (progress == null) return null;
  const x = from[0] + (to[0] - from[0]) * progress;
  const y = from[1] + (to[1] - from[1]) * progress;
  return (
    <mesh position={[x, y, 0.3]}>
      <sphereGeometry args={[0.13, 16, 16]} />
      <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={1} />
    </mesh>
  );
}

function Scene({ accentColor, activeLivreIndex, particleProgress }) {
  const activeLivre = activeLivreIndex != null ? LIVRES[activeLivreIndex] : null;
  const activeAuteurIndex = activeLivre ? AUTEURS.findIndex((a) => a.id === activeLivre.auteur_id) : null;
  const activeAuteur = activeAuteurIndex != null ? AUTEURS[activeAuteurIndex] : null;

  const from = activeLivre ? [LIVRES_X - 1.6, rowY(activeLivreIndex, LIVRES.length), 0] : null;
  const to = activeAuteur ? [AUTEURS_X + 1.6, rowY(activeAuteurIndex, AUTEURS.length), 0] : null;
  const mid = from && to ? [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2 + 0.3, 0.2] : null;

  return (
    <>
      <ambientLight intensity={0.9} />
      <pointLight position={[0, 5, 6]} intensity={120} />

      <Text position={[AUTEURS_X, rowY(-1, AUTEURS.length) + 0.75, 0]} fontSize={0.26} color={accentColor} anchorX="center">
        auteurs
      </Text>
      {AUTEURS.map((a, i) => (
        <Row
          key={a.id}
          x={AUTEURS_X}
          y={rowY(i, AUTEURS.length)}
          label={`#${a.id} ${a.nom}`}
          highlighted={activeAuteurIndex === i}
          accentColor={accentColor}
        />
      ))}

      <Text position={[LIVRES_X, rowY(-1, LIVRES.length) + 0.75, 0]} fontSize={0.26} color={accentColor} anchorX="center">
        livres
      </Text>
      {LIVRES.map((l, i) => (
        <Row
          key={l.id}
          x={LIVRES_X}
          y={rowY(i, LIVRES.length)}
          label={`#${l.id} ${l.titre}`}
          highlighted={activeLivreIndex === i}
          accentColor={accentColor}
        />
      ))}

      {from && to && (
        <>
          <Line points={[from, to]} color={accentColor} lineWidth={2} transparent opacity={0.6} />
          <Text position={mid} fontSize={0.17} color="#facc15" anchorX="center" anchorY="middle">
            {`livres.auteur_id (${activeLivre.auteur_id}) = auteurs.id (${activeAuteur.id})`}
          </Text>
          <Particle from={from} to={to} progress={particleProgress} />
        </>
      )}

      <OrbitControls enablePan={false} minDistance={6} maxDistance={18} />
    </>
  );
}

export default function RelationalCityScene({ accentColor = "#22e0f0" }) {
  const [activeLivreIndex, setActiveLivreIndex] = useState(null);
  const [particleProgress, setParticleProgress] = useState(null);
  const [running, setRunning] = useState(false);
  const timeoutRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const animateParticle = (onDone) => {
    const start = performance.now();
    const duration = 1700;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setParticleProgress(p);
      if (p < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        onDone();
      }
    };
    frameRef.current = requestAnimationFrame(tick);
  };

  const startJoin = () => {
    if (running) return;
    setRunning(true);
    let i = 0;
    const next = () => {
      if (i >= LIVRES.length) {
        setRunning(false);
        setActiveLivreIndex(null);
        setParticleProgress(null);
        return;
      }
      setActiveLivreIndex(i);
      setParticleProgress(0);
      animateParticle(() => {
        timeoutRef.current = setTimeout(() => {
          i += 1;
          next();
        }, 1200);
      });
    };
    next();
  };

  const activeLivre = activeLivreIndex != null ? LIVRES[activeLivreIndex] : null;
  const activeAuteur = activeLivre ? AUTEURS.find((a) => a.id === activeLivre.auteur_id) : null;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas camera={{ position: [0, 0, 10.5], fov: 50 }} style={{ width: "100%", height: "100%", background: "#11162a" }}>
        <Scene accentColor={accentColor} activeLivreIndex={activeLivreIndex} particleProgress={particleProgress} />
      </Canvas>

      {activeLivre && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            textAlign: "center",
            background: "rgba(10,13,24,0.85)",
            border: `1px solid ${accentColor}`,
            borderRadius: 10,
            padding: "8px 14px",
            color: "#e6edf3",
            fontSize: 13,
          }}
        >
          Le livre <strong style={{ color: accentColor }}>« {activeLivre.titre} »</strong> a pour <code>auteur_id = {activeLivre.auteur_id}</code>,
          qui correspond à <strong style={{ color: accentColor }}>{activeAuteur?.nom}</strong> dans la table <code>auteurs</code>.
        </div>
      )}

      <button
        onClick={startJoin}
        disabled={running}
        style={{
          position: "absolute",
          bottom: 14,
          left: "50%",
          transform: "translateX(-50%)",
          background: accentColor,
          color: "#04141a",
          fontWeight: 700,
          fontSize: 13,
          border: "none",
          borderRadius: 8,
          padding: "10px 22px",
          opacity: running ? 0.6 : 1,
          cursor: running ? "default" : "pointer",
        }}
      >
        {running ? "Jointure en cours…" : "Simuler la jointure livres ⋈ auteurs"}
      </button>
    </div>
  );
}
