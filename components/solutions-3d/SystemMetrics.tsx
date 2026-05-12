"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float } from "@react-three/drei";
import * as THREE from "three";

export function SystemMetrics({ position, memoryUsage }: { position: [number, number, number], memoryUsage: number }) {
  const barsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (barsRef.current) {
      barsRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          const s = (memoryUsage / 20) + Math.sin(state.clock.getElapsedTime() * 2 + i) * 0.2;
          child.scale.y = s;
          child.position.y = (s * 1.5) / 2;
          // Color shift based on scale
          if (child.material instanceof THREE.MeshStandardMaterial) {
            const hue = 0.6 - (s - 0.8) * 0.3; // Shifts from blue to violet
            child.material.color.setHSL(hue, 0.8, 0.5);
          }
        }
      });
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text
          position={[0, 3, 0]}
          fontSize={0.4}
          color="#a78bfa"
          anchorX="center"
          anchorY="middle"
        >
          REAL-TIME ENGINE METRICS
        </Text>
        
        <group ref={barsRef} position={[-2, 0, 0]}>
          {[...Array(10)].map((_, i) => (
            <mesh key={i} position={[i * 0.5, 0, 0]}>
              <boxGeometry args={[0.3, 1.5, 0.3]} />
              <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} />
            </mesh>
          ))}
        </group>

        <group position={[0, -1, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2, 2.2, 64]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1} />
          </mesh>
          <Text
            position={[0, 0, 0.1]}
            fontSize={0.25}
            color="#34d399"
          >
            ENGINE LOAD: {memoryUsage}%
          </Text>
        </group>
      </Float>
    </group>
  );
}
