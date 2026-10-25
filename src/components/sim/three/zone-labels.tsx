"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useSceneStore } from "./camera-store";
import { SPOTS } from "./site";

const labels = [
  { id: "weighbridge", name: "Arrivals", y: 4.5 },
  { id: "baleYard", name: "Bale yard", y: 4.5 },
  { id: "sorting", name: "Sorting", y: 8 },
  { id: "wash", name: "Wash line", y: 8 },
  { id: "pelletizer", name: "Pellets", y: 7 },
  { id: "etp", name: "Water loop", y: 5 },
  { id: "finishedGoods", name: "Finished goods", y: 8 },
  { id: "dock", name: "Dispatch", y: 4 },
] as const;

function Label({ name, x, y, z, active }: { name: string; x: number; y: number; z: number; active: boolean }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.fillStyle = active ? "#b2eacb" : "#073a3b";
    context.strokeStyle = active ? "#eac46e" : "#a4d9c8";
    context.lineWidth = 5;
    context.beginPath();
    context.roundRect(4, 4, 504, 120, 28);
    context.fill();
    context.stroke();
    context.fillStyle = active ? "#073a3b" : "#ffffff";
    context.font = "600 47px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(name, 256, 66);
    const result = new THREE.CanvasTexture(canvas);
    result.colorSpace = THREE.SRGBColorSpace;
    return result;
  }, [name, active]);

  useEffect(() => () => texture?.dispose(), [texture]);
  if (!texture) return null;
  return (
    <sprite position={[x, y, z]} scale={[16, 4, 1]} renderOrder={10}>
      <spriteMaterial map={texture} transparent depthTest={false} depthWrite={false} toneMapped={false} />
    </sprite>
  );
}

export function ZoneLabels() {
  const selected = useSceneStore((state) => state.selected);
  return (
    <group>
      {labels.map(({ id, name, y }) => {
        const spot = SPOTS[id];
        return <Label key={id} name={name} x={spot.x} y={y} z={spot.z} active={selected === id} />;
      })}
    </group>
  );
}
