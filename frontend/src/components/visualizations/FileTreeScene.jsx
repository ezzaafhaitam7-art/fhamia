import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, Text } from "@react-three/drei";

const TREE = {
  name: "/",
  type: "dir",
  children: [
    {
      name: "home",
      type: "dir",
      children: [
        {
          name: "user",
          type: "dir",
          children: [
            { name: "documents", type: "dir", children: [{ name: "notes.txt", type: "file", children: [] }] },
            { name: "photos", type: "dir", children: [] },
            { name: "readme.txt", type: "file", children: [] },
          ],
        },
      ],
    },
    { name: "etc", type: "dir", children: [{ name: "config.conf", type: "file", children: [] }] },
    { name: "var", type: "dir", children: [{ name: "log", type: "dir", children: [] }] },
  ],
};

const DEPTH_STEP = 1.5;
const MAX_DEPTH = 4;
const Y_OFFSET = (MAX_DEPTH * DEPTH_STEP) / 2;

function layout(node, depth, x, spread, out, parentPos, path) {
  const pos = [x, Y_OFFSET - depth * DEPTH_STEP, 0];
  const fullPath = path ? `${path}/${node.name}` : node.name;
  out.push({ node, pos, parentPos, depth, fullPath });
  const children = node.children || [];
  const step = spread / Math.max(children.length, 1);
  children.forEach((child, i) => {
    const childX = x - spread / 2 + step * i + step / 2;
    layout(child, depth + 1, childX, step * 0.9, out, pos, fullPath);
  });
}

function Node({ item, accentColor, onHover, hovered }) {
  const [node, pos] = [item.node, item.pos];
  const isDir = node.type === "dir";
  const isHovered = hovered === item;

  return (
    <group position={pos}>
      <mesh
        onPointerOver={() => onHover(item)}
        onPointerOut={() => onHover(null)}
        scale={isHovered ? 1.35 : 1}
      >
        {isDir ? <sphereGeometry args={[0.32, 24, 24]} /> : <boxGeometry args={[0.42, 0.42, 0.42]} />}
        <meshStandardMaterial
          color={isDir ? accentColor : "#e2b714"}
          emissive={isDir ? accentColor : "#e2b714"}
          emissiveIntensity={isHovered ? 0.9 : 0.35}
        />
      </mesh>
      <Text position={[0, -0.46, 0]} fontSize={0.26} color="#e6edf3" anchorX="center" anchorY="top" outlineWidth={0.012} outlineColor="#000">
        {node.name}
      </Text>
    </group>
  );
}

function Tree({ accentColor, onHover, hovered, items }) {
  return (
    <>
      {items.map(
        (item, i) =>
          item.parentPos && (
            <Line key={`line-${i}`} points={[item.parentPos, item.pos]} color={accentColor} opacity={0.4} transparent lineWidth={1} />
          )
      )}
      {items.map((item, i) => (
        <Node key={i} item={item} accentColor={accentColor} onHover={onHover} hovered={hovered} />
      ))}
    </>
  );
}

export default function FileTreeScene({ accentColor = "#22e0f0" }) {
  const [hovered, setHovered] = useState(null);
  const items = [];
  layout(TREE, 0, 0, 8, items, null, "");

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas camera={{ position: [0, 0, 11], fov: 50 }} style={{ width: "100%", height: "100%", background: "#05070d" }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={80} />
        <Tree accentColor={accentColor} onHover={setHovered} hovered={hovered} items={items} />
        <OrbitControls enablePan={false} minDistance={5} maxDistance={18} target={[0, 0, 0]} />
      </Canvas>

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
          fontFamily: "monospace",
        }}
      >
        {hovered ? `/${hovered.fullPath} (${hovered.node.type === "dir" ? "dossier" : "fichier"})` : "Survole un dossier ou un fichier pour voir son chemin complet."}
      </div>
    </div>
  );
}
