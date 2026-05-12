"use client";

import { Html, Float } from "@react-three/drei";
import { ReactNode } from "react";

interface DataPanelProps {
  position: [number, number, number];
  title: string;
  children: ReactNode;
  width?: string;
}

export function DataPanel({ position, title, children, width = "350px" }: DataPanelProps) {
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh position={position}>
        <planeGeometry args={[4, 2.5]} />
        <meshStandardMaterial 
          color="#0f172a" 
          transparent 
          opacity={0.8} 
          metalness={0.5} 
          roughness={0.2} 
        />
        <Html transform occlude distanceFactor={3} position={[0, 0, 0.02]} style={{ width }}>
          <div className="bg-slate-900/90 border border-violet-500/30 rounded-xl p-4 text-white shadow-2xl backdrop-blur-md">
            <h3 className="text-violet-400 font-bold mb-3 border-b border-violet-500/20 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              {title}
            </h3>
            <div className="space-y-3 text-sm">
              {children}
            </div>
          </div>
        </Html>
      </mesh>
    </Float>
  );
}
