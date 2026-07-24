import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";

const LAYER_SIZES = [4, 5, 3, 2];

function buildLayout() {
  return LAYER_SIZES.map((size, li) => {
    const x = li * 2.6 - (LAYER_SIZES.length - 1) * 1.3;
    return Array.from({ length: size }).map((_, i) => [x, i * 0.9 - (size - 1) * 0.45, 0]);
  });
}

function Neuron({ position, active, accentColor }) {
  return (
    <mesh position={position} scale={active ? 1.4 : 1}>
      <sphereGeometry args={[0.22, 24, 24]} />
      <meshStandardMaterial
        color={active ? accentColor : "#7d8bb0"}
        emissive={active ? accentColor : "#4a5578"}
        emissiveIntensity={active ? 1.1 : 0.5}
      />
    </mesh>
  );
}

function Scene({ layers, activeLayer, accentColor }) {
  return (
    <>
      <ambientLight intensity={1.1} />
      <pointLight position={[0, 5, 6]} intensity={140} />
      <pointLight position={[0, -5, 4]} intensity={60} color={accentColor} />

      {layers.slice(0, -1).map((layer, li) =>
        layer.map((from, fi) =>
          layers[li + 1].map((to, ti) => (
            <Line
              key={`${li}-${fi}-${ti}`}
              points={[from, to]}
              color={activeLayer === li || activeLayer === li + 1 ? accentColor : "#5a6688"}
              lineWidth={1}
              transparent
              opacity={activeLayer === li ? 0.95 : 0.5}
            />
          ))
        )
      )}

      {layers.map((layer, li) =>
        layer.map((pos, i) => (
          <Neuron key={`${li}-${i}`} position={pos} active={activeLayer === li} accentColor={accentColor} />
        ))
      )}

      <OrbitControls enablePan={false} minDistance={5} maxDistance={16} />
    </>
  );
}

export default function NeuralNetworkScene({ accentColor = "#a855f7" }) {
  const layers = useMemo(buildLayout, []);
  const [activeLayer, setActiveLayer] = useState(-1);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const startPropagation = () => {
    if (running) return;
    setRunning(true);
    let step = 0;
    setActiveLayer(0);
    intervalRef.current = setInterval(() => {
      step += 1;
      if (step >= layers.length) {
        clearInterval(intervalRef.current);
        setActiveLayer(-1);
        setRunning(false);
        return;
      }
      setActiveLayer(step);
    }, 1400);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas camera={{ position: [0, 0, 9], fov: 50 }} style={{ width: "100%", height: "100%", background: "#11162a" }}>
        <Scene layers={layers} activeLayer={activeLayer} accentColor={accentColor} />
      </Canvas>

      <button
        onClick={startPropagation}
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
        {running ? "Propagation en cours…" : "Lancer la propagation avant"}
      </button>
    </div>
  );
}
