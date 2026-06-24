"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Stars,
  Html,
  Float,
  PerformanceMonitor,
  BakeShadows,
  Text,
} from "@react-three/drei";
import * as THREE from "three";
import {
  SalesLead,
  seedSalesLeads,
  pipelineStages,
} from "@/lib/seed-data";
import { useFirestoreCollection } from "@/lib/firestore-realtime";
import { OnboardingTour } from "./OnboardingTour";

// ─── Stage colours ────────────────────────────────────────────────────────────
const STAGE_CONFIG: Record<
  string,
  { color: string; emissive: string; label: string; x: number }
> = {
  prospect:     { color: "#6366f1", emissive: "#4338ca", label: "Prospect",     x: -8 },
  qualified:    { color: "#8b5cf6", emissive: "#7c3aed", label: "Qualified",    x: -4 },
  proposal:     { color: "#f59e0b", emissive: "#d97706", label: "Proposal",     x:  0 },
  negotiation:  { color: "#f97316", emissive: "#ea580c", label: "Negotiation",  x:  4 },
  "closed-won": { color: "#10b981", emissive: "#059669", label: "Closed Won",   x:  8 },
};

// ─── Particle stream between stages ──────────────────────────────────────────

function ParticleStream({ from, to, color }: { from: [number, number, number]; to: [number, number, number]; color: string }) {
  const count = 24;
  const refs = useRef<THREE.Mesh[]>([]);
  const offsets = useMemo(
    () => Array.from({ length: count }, (_, i) => i / count),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.4;
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const progress = ((offsets[i] + t) % 1);
      mesh.position.lerpVectors(
        new THREE.Vector3(...from),
        new THREE.Vector3(...to),
        progress
      );
      mesh.scale.setScalar(0.5 + Math.sin(progress * Math.PI) * 0.5);
    });
  });

  return (
    <>
      {offsets.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) refs.current[i] = el; }}
        >
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </>
  );
}

// ─── Stage Orb ────────────────────────────────────────────────────────────────

function StageOrb({
  stage,
  leads,
  totalValue,
  isSelected,
  onClick,
}: {
  stage: string;
  leads: SalesLead[];
  totalValue: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const cfg = STAGE_CONFIG[stage];
  const radius = Math.max(0.6, Math.min(2.2, 0.6 + leads.length * 0.25));
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group position={[cfg.x, 0, 0]} onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); }}>
      <Float speed={1.5} floatIntensity={0.6} rotationIntensity={0.2}>
        <mesh ref={meshRef} castShadow>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial
            color={cfg.color}
            emissive={cfg.emissive}
            emissiveIntensity={isSelected ? 1.2 : 0.4}
            roughness={0.15}
            metalness={0.6}
          />
        </mesh>

        {/* Stage label */}
        <Text
          position={[0, -(radius + 0.5), 0]}
          fontSize={0.22}
          color="white"
          anchorX="center"
        >
          {cfg.label}
        </Text>
        <Text
          position={[0, -(radius + 0.85), 0]}
          fontSize={0.16}
          color={cfg.color}
          anchorX="center"
        >
          {leads.length} deal{leads.length !== 1 ? "s" : ""} · ${(totalValue / 1000).toFixed(0)}k
        </Text>

        {/* Detail panel */}
        {isSelected && (
          <Html distanceFactor={10} position={[0, radius + 1.2, 0]}>
            <div className="pointer-events-none w-[clamp(180px,40vw,280px)] rounded-xl border border-white/10 bg-slate-900/95 p-4 backdrop-blur-md shadow-2xl hidden md:block animate-in fade-in zoom-in-95 duration-200">
              <div
                className="mb-2 text-xs font-bold uppercase tracking-widest"
                style={{ color: cfg.color }}
              >
                {cfg.label} Stage
              </div>
              <div className="max-h-[180px] space-y-2 overflow-y-auto">
                {leads.slice(0, 6).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1.5"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {lead.companyName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {lead.salesRep} · {lead.industry}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400">
                        ${(lead.dealValue / 1000).toFixed(0)}k
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {lead.probability}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {leads.length > 6 && (
                <div className="mt-2 text-center text-[10px] text-slate-500">
                  +{leads.length - 6} more deals
                </div>
              )}
            </div>
          </Html>
        )}
      </Float>
    </group>
  );
}

// ─── Main scene ───────────────────────────────────────────────────────────────

import { useWebGLAvailable } from "./useWebGLAvailable";

export function SalesPipeline3D() {
  const [dpr, setDpr] = useState(1.5);
  const [perf, setPerf] = useState<"high" | "low">("high");
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const isGl = useWebGLAvailable();

  const { data: leads } = useFirestoreCollection<SalesLead>(
    "sales_pipeline",
    [],
    seedSalesLeads
  );

  const byStage = useMemo(() => {
    const map: Record<string, SalesLead[]> = {};
    pipelineStages.forEach((s) => (map[s] = []));
    leads.forEach((l) => {
      if (map[l.stage]) map[l.stage].push(l);
    });
    return map;
  }, [leads]);

  const totalValue = useMemo(
    () => leads.reduce((acc, l) => acc + l.dealValue, 0),
    [leads]
  );

  const weightedValue = useMemo(
    () => leads.reduce((acc, l) => acc + l.dealValue * (l.probability / 100), 0),
    [leads]
  );

  const selectedLead = useMemo(() => {
    return leads.find(l => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  if (!isGl) {
    // Premium 2D Kanban Board Fallback
    return (
      <div className="h-full w-full bg-[#030712] text-white pt-16 px-6 pb-6 overflow-hidden select-none flex flex-col justify-between">
        
        {/* Header summary */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border border-white/5 bg-slate-900/35 backdrop-blur-md rounded-2xl p-4 gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Sales Pipeline Board
              <span className="text-[9px] font-extrabold uppercase bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded border border-violet-500/30">
                2D Operational Board
              </span>
            </h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
              Review and update stage opportunities in real-time
            </p>
          </div>
          <div className="flex gap-4 text-xs font-mono text-center">
            <div className="bg-slate-950/60 border border-white/5 px-3 py-1.5 rounded-xl">
              <div className="text-slate-500 text-[10px] uppercase">Active Pipeline</div>
              <div className="text-white font-bold">${(totalValue / 1000).toFixed(0)}k</div>
            </div>
            <div className="bg-slate-950/60 border border-white/5 px-3 py-1.5 rounded-xl">
              <div className="text-slate-500 text-[10px] uppercase">Weighted</div>
              <div className="text-indigo-400 font-bold">${(weightedValue / 1000).toFixed(0)}k</div>
            </div>
          </div>
        </div>

        {/* 5-Column Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto overflow-y-auto pb-4 items-stretch min-h-[400px]">
          {pipelineStages.map((stage) => {
            const stageLeads = byStage[stage] ?? [];
            const cfg = STAGE_CONFIG[stage] ?? { color: "#6366f1", label: stage };
            const stageValue = stageLeads.reduce((a, l) => a + l.dealValue, 0);

            return (
              <div 
                key={stage} 
                className="bg-slate-900/20 border border-white/5 rounded-2xl p-3 flex flex-col min-w-[210px] max-h-full overflow-hidden"
              >
                {/* Column header */}
                <div className="border-b border-white/5 pb-2 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                    <span className="font-bold text-xs text-white truncate">{cfg.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded font-mono">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {stageLeads.map((lead) => {
                    const isSelected = selectedLeadId === lead.id;
                    return (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLeadId(isSelected ? null : lead.id)}
                        className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                          isSelected 
                            ? "bg-white/10 border-white/30 shadow-lg shadow-white/5" 
                            : "bg-slate-950/40 border-white/5 hover:border-white/10 hover:bg-slate-950/60"
                        }`}
                      >
                        <div className="font-bold text-xs text-white truncate">{lead.companyName}</div>
                        <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                          <span>{lead.salesRep}</span>
                          <span className="text-teal-400 font-semibold">{lead.industry}</span>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                          <span className="text-emerald-400 font-extrabold">${(lead.dealValue / 1000).toFixed(0)}k</span>
                          <span className="text-[10px] text-slate-500">{lead.probability}%</span>
                        </div>
                      </div>
                    );
                  })}
                  {stageLeads.length === 0 && (
                    <div className="text-center py-8 text-slate-600 text-[10px] uppercase font-mono">
                      No deals
                    </div>
                  )}
                </div>

                {/* Stage aggregate footer */}
                <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>STAGE VALUE:</span>
                  <span className="text-white font-bold">${(stageValue / 1000).toFixed(0)}k</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Lead HUD Overlay */}
        {selectedLead && (
          <div className="mt-4 p-4 border border-teal-500/20 bg-teal-950/10 rounded-2xl flex justify-between items-center animate-fade-in">
            <div className="flex gap-4 items-center">
              <div>
                <div className="text-xs text-slate-400">Selected Company</div>
                <div className="text-sm font-bold text-white">{selectedLead.companyName}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Lead Owner</div>
                <div className="text-sm font-bold text-white">{selectedLead.contactName}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Probability</div>
                <div className="text-sm font-bold text-indigo-400">{selectedLead.probability}%</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Closing Date</div>
              <div className="text-sm font-bold text-white">
                {new Date(selectedLead.closingDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = (pipelineStages as readonly string[]).indexOf(selectedStage || "");
    if (e.key === "Tab" || e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % pipelineStages.length;
      setSelectedStage(pipelineStages[nextIndex]);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + pipelineStages.length) % pipelineStages.length;
      setSelectedStage(pipelineStages[prevIndex]);
    } else if (e.key === "Escape") {
      setSelectedStage(null);
    }
  };

  const selectedStageLeads = selectedStage ? byStage[selectedStage] ?? [] : [];

  return (
    <div
      className="relative h-[600px] w-full focus-within:ring-2 focus-within:ring-teal-500/50 focus-within:outline-none rounded-3xl overflow-hidden"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="3D Sales Pipeline. Use Arrow keys or Tab key to cycle through pipeline stages, and Escape to clear selection."
      onClick={() => setSelectedStage(null)}
    >
      <OnboardingTour sceneKey="sales" />
      {/* Screen-reader accessible sales pipeline data table */}
      <table className="sr-only">
        <caption>Sales Pipeline Stage Summary</caption>
        <thead>
          <tr>
            <th scope="col">Pipeline Stage</th>
            <th scope="col">Deals Count</th>
            <th scope="col">Total Value</th>
          </tr>
        </thead>
        <tbody>
          {pipelineStages.map((stage) => {
            const stageLeads = byStage[stage] ?? [];
            const val = stageLeads.reduce((a, l) => a + l.dealValue, 0);
            return (
              <tr key={stage}>
                <td>{STAGE_CONFIG[stage]?.label ?? stage}</td>
                <td>{stageLeads.length}</td>
                <td>${val.toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Canvas shadows dpr={dpr}>
        <PerformanceMonitor
          onIncline={() => { setDpr(2); setPerf("high"); }}
          onDecline={() => { setDpr(1); setPerf("low"); }}
        />
        {perf === "low" && <BakeShadows />}

        <PerspectiveCamera makeDefault position={[0, 4, 18]} fov={55} />
        <OrbitControls
          enablePan={false}
          minDistance={10}
          maxDistance={32}
          autoRotate={perf === "high"}
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 6}
        />

        <ambientLight intensity={0.25} />
        <pointLight position={[0, 15, 10]} intensity={4} color="#8b5cf6" castShadow />
        <pointLight position={[-12, 5, 0]} intensity={2} color="#6366f1" />
        <pointLight position={[12, 5, 0]} intensity={2} color="#10b981" />

        {perf === "high" && (
          <Stars radius={100} depth={50} count={2500} factor={3} fade speed={0.5} />
        )}

        {/* Particle streams between consecutive stages */}
        {perf === "high" && pipelineStages.slice(0, -1).map((stage, i) => {
          const next = pipelineStages[i + 1];
          const fromX = STAGE_CONFIG[stage].x;
          const toX = STAGE_CONFIG[next].x;
          return (
            <ParticleStream
              key={`stream-${i}`}
              from={[fromX, 0, 0]}
              to={[toX, 0, 0]}
              color={STAGE_CONFIG[next].color}
            />
          );
        })}

        {/* Stage orbs */}
        {pipelineStages.map((stage) => (
          <StageOrb
            key={stage}
            stage={stage}
            leads={byStage[stage] ?? []}
            totalValue={(byStage[stage] ?? []).reduce((a, l) => a + l.dealValue, 0)}
            isSelected={selectedStage === stage}
            onClick={() => setSelectedStage(stage === selectedStage ? null : stage)}
          />
        ))}

        <gridHelper args={[40, 40, "#1e293b", "#0f172a"]} position={[0, -3, 0]} />
      </Canvas>

      {/* Pipeline KPI strip */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-6 rounded-2xl border border-white/10 bg-slate-900/80 px-6 py-3 backdrop-blur-md">
        {[
          { label: "Total Deals", value: leads.length.toString() },
          { label: "Pipeline Value", value: `$${(totalValue / 1000).toFixed(0)}k` },
          { label: "Weighted Value", value: `$${(weightedValue / 1000).toFixed(0)}k` },
          { label: "Win Rate", value: `${leads.length > 0 ? Math.round((byStage["closed-won"]?.length / leads.length) * 100) : 0}%` },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="text-xs text-slate-400">{label}</div>
            <div className="text-base font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute left-6 top-6 text-[10px] uppercase tracking-widest text-slate-500">
        Real-time sync · click a stage to drill down
      </div>

      {/* Mobile / Responsive Bottom Sheet for Stage details */}
      {selectedStage && (
        <div className="absolute bottom-20 left-4 right-4 bg-slate-950/90 border border-white/10 p-4 rounded-2xl backdrop-blur-md z-20 pointer-events-auto md:hidden animate-in slide-in-from-bottom duration-300 max-h-[220px] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {STAGE_CONFIG[selectedStage]?.label ?? selectedStage} Deals
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedStage(null);
              }}
              className="text-xs text-slate-400 hover:text-white"
              style={{ minHeight: "44px", minWidth: "44px" }}
            >
              Close
            </button>
          </div>
          <div className="space-y-2">
            {selectedStageLeads.length === 0 ? (
              <div className="text-xs text-slate-400">No deals in this stage.</div>
            ) : (
              selectedStageLeads.map((lead) => (
                <div key={lead.id} className="flex justify-between items-center text-xs">
                  <span className="text-white font-semibold">{lead.companyName}</span>
                  <span className="text-slate-400">${lead.dealValue.toLocaleString()} ({lead.probability}%)</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

