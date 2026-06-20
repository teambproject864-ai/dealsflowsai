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
  MarketingCampaign,
  seedMarketingCampaigns,
} from "@/lib/seed-data";
import { useFirestoreCollection } from "@/lib/firestore-realtime";

// ─── Convert lat/lng to 3D sphere position ────────────────────────────────────

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// ─── Channel colours ──────────────────────────────────────────────────────────

const CHANNEL_CONFIG: Record<string, { color: string; label: string; torusRadius: number }> = {
  email:     { color: "#6366f1", label: "Email",     torusRadius: 4.2 },
  linkedin:  { color: "#0ea5e9", label: "LinkedIn",  torusRadius: 4.8 },
  paid:      { color: "#f59e0b", label: "Paid",      torusRadius: 5.4 },
  organic:   { color: "#10b981", label: "Organic",   torusRadius: 6.0 },
  events:    { color: "#ec4899", label: "Events",    torusRadius: 6.6 },
};

// ─── Globe ────────────────────────────────────────────────────────────────────

function EarthGlobe({ onHotspotClick, selectedId }: {
  onHotspotClick: (c: MarketingCampaign) => void;
  selectedId: string | null;
}) {
  const globeRef = useRef<THREE.Mesh>(null);
  const { data: campaigns } = useFirestoreCollection<MarketingCampaign>(
    "marketing_campaigns",
    [],
    seedMarketingCampaigns
  );

  useFrame((_, delta) => {
    if (globeRef.current) globeRef.current.rotation.y += delta * 0.05;
  });

  return (
    <group>
      {/* Globe mesh */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[3, 48, 48]} />
        <meshStandardMaterial
          color="#0f172a"
          emissive="#1e3a5f"
          emissiveIntensity={0.2}
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[3.02, 24, 24]} />
        <meshStandardMaterial
          color="#334155"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Campaign hotspot pins */}
      {campaigns.map((campaign) => {
        const pos = latLngToVec3(campaign.lat, campaign.lng, 3.1);
        const cfg = CHANNEL_CONFIG[campaign.channel] ?? { color: "#ffffff" };
        const isSelected = selectedId === campaign.id;
        return (
          <group
            key={campaign.id}
            position={pos}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              onHotspotClick(campaign);
            }}
          >
            <Float speed={3} floatIntensity={0.3}>
              <mesh>
                <sphereGeometry args={[0.12 + (campaign.conversions / 2000), 12, 12]} />
                <meshStandardMaterial
                  color={cfg.color}
                  emissive={cfg.color}
                  emissiveIntensity={isSelected ? 2 : 0.8}
                />
              </mesh>
              {isSelected && (
                <Html distanceFactor={12} position={[0.3, 0.3, 0]}>
                  <div className="pointer-events-none w-[210px] rounded-xl border border-white/10 bg-slate-900/95 p-3 backdrop-blur-md shadow-2xl">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: cfg.color }}>
                      {campaign.channel}
                    </div>
                    <div className="text-sm font-bold text-white">{campaign.name}</div>
                    <div className="mt-2 space-y-1 text-xs">
                      {[
                        { l: "Reach",       v: campaign.reach.toLocaleString() },
                        { l: "Clicks",      v: campaign.clicks.toLocaleString() },
                        { l: "Conversions", v: campaign.conversions.toLocaleString() },
                        { l: "CPL",         v: campaign.cpl > 0 ? `$${campaign.cpl}` : "Organic" },
                      ].map(({ l, v }) => (
                        <div key={l} className="flex justify-between">
                          <span className="text-slate-400">{l}</span>
                          <span className="font-semibold text-white">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
                      >
                        {campaign.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </Html>
              )}
            </Float>
          </group>
        );
      })}
    </group>
  );
}

// ─── Channel Torus Rings ──────────────────────────────────────────────────────

function ChannelRings({ campaigns }: { campaigns: MarketingCampaign[] }) {
  const refs = useRef<THREE.Mesh[]>([]);
  const channels = useMemo(() => Object.keys(CHANNEL_CONFIG), []);

  useFrame((_, delta) => {
    refs.current.forEach((mesh, i) => {
      if (mesh) mesh.rotation.z += delta * (0.15 + i * 0.05) * (i % 2 === 0 ? 1 : -1);
    });
  });

  return (
    <>
      {channels.map((channel, i) => {
        const cfg = CHANNEL_CONFIG[channel];
        const channelCampaigns = campaigns.filter((c) => c.channel === channel);
        const totalReach = channelCampaigns.reduce((a, c) => a + c.reach, 0);
        const opacity = channelCampaigns.length > 0 ? 0.45 : 0.1;

        return (
          <group key={channel} rotation={[Math.PI / 6 * (i - 2), 0, i * 0.4]}>
            <mesh ref={(el) => { if (el) refs.current[i] = el; }}>
              <torusGeometry args={[cfg.torusRadius, 0.05, 8, 80]} />
              <meshStandardMaterial
                color={cfg.color}
                emissive={cfg.color}
                emissiveIntensity={0.6}
                transparent
                opacity={opacity}
              />
            </mesh>

            {/* Engagement arc proportional to reach */}
            {channelCampaigns.length > 0 && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[cfg.torusRadius, 0.09, 8, 60, Math.min((totalReach / 25000) * Math.PI, Math.PI * 1.8)]} />
                <meshStandardMaterial
                  color={cfg.color}
                  emissive={cfg.color}
                  emissiveIntensity={1.2}
                  transparent
                  opacity={0.9}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </>
  );
}

// ─── Main scene ───────────────────────────────────────────────────────────────

import { useWebGLAvailable } from "./useWebGLAvailable";
import { Globe, BarChart2, DollarSign, Target, Percent } from "lucide-react";

export function MarketingCampaignViewer3D() {
  const [dpr, setDpr] = useState(1.5);
  const [perf, setPerf] = useState<"high" | "low">("high");
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);
  const isGl = useWebGLAvailable();

  const { data: campaigns } = useFirestoreCollection<MarketingCampaign>(
    "marketing_campaigns",
    [],
    seedMarketingCampaigns
  );

  const metrics = useMemo(() => ({
    totalReach:       campaigns.reduce((a, c) => a + c.reach, 0),
    totalConversions: campaigns.reduce((a, c) => a + c.conversions, 0),
    totalSpend:       campaigns.reduce((a, c) => a + c.spend, 0),
    avgCpl:           campaigns.filter((c) => c.cpl > 0).reduce((a, c, _, arr) => a + c.cpl / arr.length, 0),
    activeCampaigns:  campaigns.filter((c) => c.status === "active").length,
  }), [campaigns]);

  const channelBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    campaigns.forEach((c) => {
      map[c.channel] = (map[c.channel] ?? 0) + c.conversions;
    });
    return map;
  }, [campaigns]);

  if (!isGl) {
    // Premium 2D Fallback Dashboard for Marketing Campaigns
    return (
      <div className="h-full w-full bg-[#030712] text-white pt-16 px-6 pb-6 overflow-hidden select-none flex flex-col justify-between">
        
        {/* Top summary row */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border border-white/5 bg-slate-900/35 backdrop-blur-md rounded-2xl p-4 gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Campaign Conversion Hub
              <span className="text-[9px] font-extrabold uppercase bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-400/30">
                2D Active Channels
              </span>
            </h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
              Interactive campaign conversion, reach and spend telemetry
            </p>
          </div>
          <div className="flex gap-4 text-xs font-mono text-center">
            <div className="bg-slate-950/60 border border-white/5 px-3 py-1.5 rounded-xl">
              <div className="text-slate-500 text-[10px] uppercase">Spend</div>
              <div className="text-white font-bold">${(metrics.totalSpend / 1000).toFixed(0)}k</div>
            </div>
            <div className="bg-slate-950/60 border border-white/5 px-3 py-1.5 rounded-xl">
              <div className="text-slate-500 text-[10px] uppercase">Conversions</div>
              <div className="text-teal-400 font-bold">{metrics.totalConversions}</div>
            </div>
          </div>
        </div>

        {/* 2-Column Dashboard Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto pb-4 items-stretch min-h-[400px]">
          
          {/* Main Campaign List (2/3 width) */}
          <div className="lg:col-span-2 bg-slate-900/20 border border-white/5 rounded-2xl p-4 flex flex-col h-full overflow-hidden">
            <div className="border-b border-white/5 pb-2 mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Globe className="h-4 w-4 text-teal-400" />
                Regional Target Channels
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{campaigns.length} Campaigns</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {campaigns.map((c) => {
                const isSelected = selectedCampaign?.id === c.id;
                const cfg = CHANNEL_CONFIG[c.channel] ?? { color: "#ffffff", label: c.channel };
                
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCampaign(isSelected ? null : c)}
                    className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex justify-between items-center ${
                      isSelected 
                        ? "bg-white/10 border-white/30 shadow-lg shadow-white/5" 
                        : "bg-slate-950/40 border-white/5 hover:border-white/10 hover:bg-slate-950/60"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                        <span className="truncate">{c.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                        {cfg.label} · {c.region}
                      </div>
                    </div>

                    <div className="flex gap-6 font-mono text-xs text-right">
                      <div>
                        <div className="text-slate-500 text-[9px] uppercase">Reach</div>
                        <div className="text-white font-bold">{c.reach.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[9px] uppercase">Conversions</div>
                        <div className="text-teal-400 font-bold">{c.conversions}</div>
                      </div>
                      <div className="hidden sm:block">
                        <div className="text-slate-500 text-[9px] uppercase">CPL</div>
                        <div className="text-white font-bold">{c.cpl > 0 ? `$${c.cpl}` : "Organic"}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metrics Summary Panel (1/3 width) */}
          <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-full overflow-hidden">
            <div className="space-y-4 flex-1">
              <div className="border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-indigo-400" />
                  Performance Analytics
                </span>
              </div>

              {/* Stats blocks */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: "Total Reach", v: metrics.totalReach.toLocaleString(), color: "text-slate-300" },
                  { label: "Conversions", v: metrics.totalConversions.toLocaleString(), color: "text-teal-400" },
                  { label: "Total Spend", v: `$${(metrics.totalSpend / 1000).toFixed(0)}k`, color: "text-white" },
                  { label: "Avg. CPL", v: `$${metrics.avgCpl.toFixed(1)}`, color: "text-indigo-300" },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-950/50 border border-white/5 p-2.5 rounded-xl">
                    <div className="text-slate-500 text-[9px] uppercase font-semibold">{stat.label}</div>
                    <div className={`text-sm font-black mt-1 ${stat.color}`}>{stat.v}</div>
                  </div>
                ))}
              </div>

              {/* Channel breakdown */}
              <div className="space-y-2 pt-2">
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block">
                  Conversions by Channel
                </label>
                <div className="space-y-2 overflow-y-auto max-h-[140px] pr-1">
                  {Object.entries(channelBreakdown).map(([ch, conv]) => {
                    const cfg = CHANNEL_CONFIG[ch];
                    const pct = metrics.totalConversions > 0 ? (conv / metrics.totalConversions) * 100 : 0;
                    return (
                      <div key={ch} className="bg-slate-950/40 p-2 border border-white/5 rounded-xl">
                        <div className="flex justify-between text-[10px] font-mono mb-1">
                          <span style={{ color: cfg?.color }} className="font-bold">{cfg?.label ?? ch}</span>
                          <span className="text-slate-400">{conv} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ width: `${pct}%`, backgroundColor: cfg?.color }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Selected Campaign HUD Overlay */}
        {selectedCampaign && (
          <div className="mt-4 p-4 border border-teal-500/20 bg-teal-950/10 rounded-2xl flex justify-between items-center animate-fade-in">
            <div className="flex gap-6 items-center">
              <div>
                <div className="text-xs text-slate-400">Campaign Name</div>
                <div className="text-sm font-bold text-white">{selectedCampaign.name}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Region</div>
                <div className="text-sm font-bold text-white">{selectedCampaign.region}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Clicks</div>
                <div className="text-sm font-bold text-indigo-400">{selectedCampaign.clicks.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Spend / Cost per Lead</div>
              <div className="text-sm font-bold text-white">
                ${selectedCampaign.spend.toLocaleString()} (CPL: ${selectedCampaign.cpl.toFixed(1)})
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-full" onClick={() => setSelectedCampaign(null)}>
      <Canvas shadows dpr={dpr}>
        <PerformanceMonitor
          onIncline={() => { setDpr(2); setPerf("high"); }}
          onDecline={() => { setDpr(1); setPerf("low"); }}
        />
        {perf === "low" && <BakeShadows />}

        <PerspectiveCamera makeDefault position={[0, 4, 16]} fov={50} />
        <OrbitControls
          enablePan={false}
          minDistance={8}
          maxDistance={28}
          autoRotate={false}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 6}
        />

        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={3} color="#6366f1" castShadow />
        <pointLight position={[-10, -5, -8]} intensity={2} color="#0ea5e9" />
        <pointLight position={[0, 12, 0]} intensity={2.5} color="#10b981" />

        {perf === "high" && (
          <Stars radius={100} depth={50} count={2000} factor={3} fade speed={0.3} />
        )}

        <EarthGlobe
          onHotspotClick={(c) => setSelectedCampaign(c?.id === selectedCampaign?.id ? null : c)}
          selectedId={selectedCampaign?.id ?? null}
        />
        <ChannelRings campaigns={campaigns} />
      </Canvas>

      {/* Metrics panel */}
      <div className="pointer-events-none absolute right-6 top-6 w-64 space-y-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-md">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Campaign Overview
        </div>
        {[
          { label: "Total Reach",       value: metrics.totalReach.toLocaleString() },
          { label: "Conversions",       value: metrics.totalConversions.toLocaleString() },
          { label: "Total Spend",       value: `$${(metrics.totalSpend / 1000).toFixed(0)}k` },
          { label: "Avg. CPL",          value: `$${metrics.avgCpl.toFixed(1)}` },
          { label: "Active Campaigns",  value: metrics.activeCampaigns.toString() },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-xs">
            <span className="text-slate-400">{label}</span>
            <span className="font-bold text-white">{value}</span>
          </div>
        ))}

        <div className="mt-3 border-t border-white/5 pt-3">
          <div className="mb-2 text-[10px] uppercase tracking-widest text-slate-500">
            Conversions by Channel
          </div>
          {Object.entries(channelBreakdown).map(([ch, conv]) => {
            const cfg = CHANNEL_CONFIG[ch];
            const pct = metrics.totalConversions > 0 ? (conv / metrics.totalConversions) * 100 : 0;
            return (
              <div key={ch} className="mb-1.5">
                <div className="mb-0.5 flex justify-between text-[10px]">
                  <span style={{ color: cfg?.color }}>{cfg?.label ?? ch}</span>
                  <span className="text-slate-400">{conv} ({pct.toFixed(0)}%)</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: cfg?.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Channel legend */}
      <div className="pointer-events-none absolute left-6 bottom-6 space-y-1.5">
        {Object.entries(CHANNEL_CONFIG).map(([ch, cfg]) => (
          <div key={ch} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
            <span className="text-xs text-slate-400">{cfg.label}</span>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute left-6 top-6 text-[10px] uppercase tracking-widest text-slate-500">
        Real-time sync · click a hotspot to inspect
      </div>
    </div>
  );
}

