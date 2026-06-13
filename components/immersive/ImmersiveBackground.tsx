"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { useImmersive } from "./ImmersiveProvider";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { VoiceOrb } from "./VoiceOrb";

// Layered Parallax Starfield Point Cloud
function NebulaParticles({
  scrollProgress,
  mouseBoost,
  count,
}: {
  scrollProgress: number;
  mouseBoost: number;
  count: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const colors = useMemo(() => new Float32Array(count * 3), [count]);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 800;
      
      const palette = Math.random();
      if (palette < 0.33) {
        colors[i * 3] = 0.49;      // Violet
        colors[i * 3 + 1] = 0.23;
        colors[i * 3 + 2] = 0.93;
      } else if (palette < 0.66) {
        colors[i * 3] = 0.08;      // Cyan/Teal
        colors[i * 3 + 1] = 0.72;
        colors[i * 3 + 2] = 0.65;
      } else {
        colors[i * 3] = 0.96;      // Gold/Amber
        colors[i * 3 + 1] = 0.62;
        colors[i * 3 + 2] = 0.04;
      }
    }
    return pos;
  }, [count, colors]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    pointsRef.current.rotation.y = t * 0.005 + mouseBoost * 0.0002;
    pointsRef.current.position.z = scrollProgress * 120;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

// 3D Glass Crystal Shard that floats and refracts light
function ShardMesh({ shard }: { shard: any }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * shard.speed;
    meshRef.current.rotation.x = t;
    meshRef.current.rotation.y = t * 0.8;
    meshRef.current.position.y = shard.initialY + Math.sin(t * 0.5) * 4;
  });

  return (
    <mesh ref={meshRef} position={[shard.initialX, shard.initialY, shard.initialZ]} scale={shard.scale}>
      {shard.type === "icosahedron" ? (
        <icosahedronGeometry args={[2, 0]} />
      ) : shard.type === "torus" ? (
        <torusGeometry args={[1.5, 0.4, 16, 100]} />
      ) : (
        <tetrahedronGeometry args={[2, 0]} />
      )}
      <meshPhysicalMaterial
        transmission={0.95}
        thickness={1.8}
        roughness={0.03}
        clearcoat={1.0}
        clearcoatRoughness={0.05}
        color={shard.color}
        ior={1.6}
        attenuationColor="#ffffff"
        attenuationDistance={1}
        transparent
      />
    </mesh>
  );
}

// Interactive 3D Cursor sphere tracking the system pointer
function Cursor3D({ cursorMode }: { cursorMode: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const orbitGroupRef = useRef<THREE.Group>(null);
  const { pointer, viewport } = useThree();
  
  // Create 6 orbit particles
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 6; i++) {
      arr.push({
        id: i,
        angle: (i * Math.PI) / 3,
        speed: 2 + Math.random() * 2,
        radius: 1.0 + Math.random() * 0.5,
      });
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    
    // Map screen cursor coords to 3D space Z-plane
    const targetX = (pointer.x * viewport.width) / 2;
    const targetY = (pointer.y * viewport.height) / 2;
    
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.25);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.25);
    // Position slightly in front of UI layer
    meshRef.current.position.z = 22; 
    
    if (orbitGroupRef.current) {
      orbitGroupRef.current.rotation.z = t * 2.0;
    }
  });

  const isGold = cursorMode === "magnetic";

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.4, 32, 32]} />
      <meshPhysicalMaterial
        color={isGold ? "#f59e0b" : "#00D4FF"}
        emissive={isGold ? "#f59e0b" : "#00D4FF"}
        emissiveIntensity={1.8}
        roughness={0.05}
        transmission={0.8}
        thickness={0.6}
        transparent
      />
      <group ref={orbitGroupRef}>
        {particles.map((p) => (
          <mesh 
            key={p.id} 
            position={[Math.cos(p.angle) * p.radius, Math.sin(p.angle) * p.radius, 0]}
          >
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshBasicMaterial color="#7c3aed" />
          </mesh>
        ))}
      </group>
    </mesh>
  );
}

// Central Scene setup
function SceneInner() {
  const { light, mouseVelocity, enable3D } = useImmersive();
  const { cursorMode } = useExperience();
  const [scrollProgress, setScrollProgress] = useState(0);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const cursorLightRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(window.scrollY / totalScroll);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { camera } = useThree();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    // Camera scroll journey: Z moves from 65 to 15
    const targetZ = 65 - scrollProgress * 45;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);

    // Dynamic tilt based on light mouse movement
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, light.nx * 6, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, -light.ny * 6, 0.05);
    camera.lookAt(0, 0, 0);

    // Ambient light breaths on a 4-second cycle
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = 0.45 + Math.sin(t * Math.PI * 0.5) * 0.15;
    }

    // Cursor light tracking coordinates
    if (cursorLightRef.current) {
      cursorLightRef.current.position.x = light.nx * 25;
      cursorLightRef.current.position.y = -light.ny * 25;
    }
  });

  // Generate crystal shards positioned at varying Z levels
  const shards = useMemo(() => {
    const list = [];
    const colors = ["#8b5cf6", "#06b6d4", "#f59e0b", "#ec4899"];
    const types = ["icosahedron", "tetrahedron", "torus"];
    
    for (let i = 0; i < 35; i++) {
      list.push({
        id: i,
        initialX: (Math.random() - 0.5) * 90,
        initialY: (Math.random() - 0.5) * 90,
        initialZ: Math.random() * 80 - 40, 
        scale: Math.random() * 1.5 + 0.8,
        speed: Math.random() * 0.4 + 0.1,
        type: types[i % types.length],
        color: colors[i % colors.length],
      });
    }
    return list;
  }, []);

  const particleCount = enable3D ? 380 : 0;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 65]} fov={60} />
      
      {/* Pulse breathing light */}
      <ambientLight ref={ambientLightRef} intensity={0.45} />
      
      {/* Dynamic lighting */}
      <directionalLight position={[10, 20, 10]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-30, -10, -10]} intensity={1.5} color="#7c3aed" />
      <pointLight position={[30, 10, -20]} intensity={2.0} color="#06b6d4" />
      
      {/* Specular Cursor Point light tracking */}
      <pointLight 
        ref={cursorLightRef} 
        position={[0, 0, 12]} 
        intensity={2.5} 
        distance={35} 
        color="#00D4FF" 
      />

      {/* 3D Cursor Mesh */}
      {enable3D && <Cursor3D cursorMode={cursorMode} />}

      {/* 3D Voice Orb Waveform Analyzer */}
      {enable3D && <VoiceOrb />}

      {/* Galaxy Arm Background Mesh */}
      <mesh position={[0, 0, -80]} rotation={[0.4, 0.5, 0]}>
        <ringGeometry args={[40, 80, 64]} />
        <meshBasicMaterial 
          color="#1e1b4b" 
          transparent 
          opacity={0.12} 
          side={THREE.DoubleSide} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Parallax Starfield */}
      {particleCount > 0 && (
        <NebulaParticles
          count={particleCount}
          scrollProgress={scrollProgress}
          mouseBoost={mouseVelocity.speed}
        />
      )}

      {/* Floating Glass shards */}
      {enable3D && shards.map((shard) => (
        <ShardMesh key={shard.id} shard={shard} />
      ))}

      {/* Post Processing Composer Effects */}
      {enable3D && (
        <EffectComposer enableNormalPass={false}>
          <Bloom 
            luminanceThreshold={0.18} 
            luminanceSmoothing={0.85} 
            intensity={1.8} 
          />
          <DepthOfField 
            focusDistance={0.4} 
            focalLength={0.08} 
            bokehScale={4.0} 
          />
          <ChromaticAberration 
            offset={new THREE.Vector2(0.0015, 0.0015)} 
          />
          <Vignette 
            eskil={false} 
            offset={0.12} 
            darkness={1.25} 
          />
        </EffectComposer>
      )}
    </>
  );
}

export function ImmersiveBackground() {
  const { enable3D, reducedMotion } = useImmersive();
  const showCanvas = enable3D && !reducedMotion;

  return (
    <>
      {/* CSS base space mesh */}
      <div className="fixed inset-0 z-0 cosmic-bg pointer-events-none" aria-hidden>
        <div className="aurora-mesh absolute inset-0 opacity-55" aria-hidden />
        <div className="grid-pattern absolute inset-0 opacity-20" aria-hidden />
      </div>
      
      {/* 3D WebGL Canvas */}
      {showCanvas && (
        <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
          <Canvas 
            dpr={[1, 1.5]} 
            gl={{ alpha: true, antialias: true, stencil: false, depth: true }} 
            style={{ background: "transparent" }}
          >
            <SceneInner />
          </Canvas>
        </div>
      )}
    </>
  );
}
