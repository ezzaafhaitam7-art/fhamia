import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";

const LAYERS = [
  { name: "Physique", desc: "Signaux électriques, câbles, ondes." },
  { name: "Liaison", desc: "Trames, adresses MAC, commutateurs." },
  { name: "Réseau", desc: "Paquets IP, routage entre réseaux." },
  { name: "Transport", desc: "Segments TCP/UDP, ports." },
  { name: "Session", desc: "Ouverture/fermeture des échanges." },
  { name: "Présentation", desc: "Format des données, chiffrement." },
  { name: "Application", desc: "HTTP, DNS, les logiciels que tu utilises." },
];

function Layer({ index, active, onSelect }) {
  const y = index * 1.1;
  const isActive = active === index;
  return (
    <group position={[0, y, 0]}>
      <mesh onClick={() => onSelect(index)} scale={isActive ? [1.08, 1, 1.08] : [1, 1, 1]}>
        <cylinderGeometry args={[2.4, 2.4, 0.4, 48]} />
        <meshStandardMaterial
          color={isActive ? "#22e0f0" : "#151b2c"}
          emissive={isActive ? "#22e0f0" : "#000"}
          emissiveIntensity={isActive ? 0.5 : 0}
          transparent
          opacity={0.9}
        />
      </mesh>
      <Text position={[2.8, 0, 0]} fontSize={0.28} color={isActive ? "#22e0f0" : "#cfd6e6"} anchorX="left" anchorY="middle">
        {LAYERS[index].name}
      </Text>
    </group>
  );
}

function Packet() {
  const ref = useRef();
  const t = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) return;
    t.current += delta * 0.5;
    const cycle = t.current % 2;
    const progress = cycle < 1 ? cycle : 2 - cycle;
    ref.current.position.y = progress * (LAYERS.length - 1) * 1.1;
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <sphereGeometry args={[0.22, 20, 20]} />
      <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.8} />
    </mesh>
  );
}

export default function OsiTowerScene({ accentColor = "#a855f7" }) {
  const [active, setActive] = useState(6);
  const orderedForList = [...LAYERS].map((l, i) => ({ ...l, index: i })).reverse();

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas camera={{ position: [7, 5, 9], fov: 50 }} style={{ width: "100%", height: "100%", background: "#05070d" }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 8, 5]} intensity={100} />
        <group position={[0, -3.3, 0]}>
          {LAYERS.map((_, i) => (
            <Layer key={i} index={i} active={active} onSelect={setActive} />
          ))}
          <Packet />
        </group>
        <OrbitControls enablePan={false} minDistance={6} maxDistance={20} />
      </Canvas>

      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          background: "rgba(10,13,24,0.85)",
          border: "1px solid var(--panel-border)",
          borderRadius: 10,
          padding: "8px 10px",
        }}
      >
        <div style={{ fontSize: 9, color: "var(--text-dim)", textAlign: "right", marginBottom: 2, textTransform: "uppercase" }}>
          Haut de la pile ↓ Bas
        </div>
        {orderedForList.map((layer) => (
          <button
            key={layer.name}
            onClick={() => setActive(layer.index)}
            style={{
              background: "none",
              border: "none",
              textAlign: "right",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: active === layer.index ? 700 : 500,
              color: active === layer.index ? accentColor : "#9aa4bf",
              padding: "2px 4px",
            }}
          >
            {layer.name}
          </button>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          right: 12,
          background: "rgba(10,13,24,0.85)",
          border: `1px solid ${accentColor}`,
          borderRadius: 10,
          padding: "10px 14px",
          color: "#e6edf3",
          fontSize: 13,
        }}
      >
        <strong style={{ color: accentColor }}>{LAYERS[active].name}</strong> — {LAYERS[active].desc}
      </div>
    </div>
  );
}
