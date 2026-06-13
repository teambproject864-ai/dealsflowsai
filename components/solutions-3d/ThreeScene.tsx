"use client";

import { Canvas } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  ContactShadows,
  Stars,
  PerformanceMonitor,
  BakeShadows
} from "@react-three/drei";
import { useState, useEffect } from "react";
import { SystemMetrics } from "./SystemMetrics";
import { UserRegistry } from "./UserRegistry";
import { FunctionalFlow } from "./FunctionalFlow";
import { MarketingElements } from "./MarketingElements";
import { DataPanel } from "./DataPanel";
import { SystemData } from "./useSystemInitialization";
import { useWebGLAvailable } from "./useWebGLAvailable";
import { 
  Cpu, 
  Users, 
  Activity, 
  ShieldCheck, 
  Terminal, 
  Server, 
  ArrowRight, 
  Database, 
  Sparkles,
  RefreshCw,
  Clock,
  Layers
} from "lucide-react";

export function ThreeScene({ data }: { data: SystemData }) {
  const [dpr, setDpr] = useState(1.5);
  const [performance, setPerformance] = useState<'high' | 'low'>('high');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const isGl = useWebGLAvailable();

  // Simulate console logs in mock mode for maximum sci-fi cockpit realism
  useEffect(() => {
    if (isGl) return;
    const actions = [
      "Inbound payload decrypted successfully.",
      "Clawpatrol firewall integrity scan: PASS (0 threats).",
      "Hermes Memory cache hit: 98.4ms retrieval latency.",
      "Veritas output checker: compliance hash generated.",
      "Twilio outbound dispatcher: queue synchronised.",
      "Salesforce contact sync complete.",
      "Google Workspace calendar invite dispatched.",
      "ElevenLabs audio confirmation stream validated."
    ];
    setTerminalLogs([
      `[${new Date().toLocaleTimeString()}] System initialization check complete.`,
      `[${new Date().toLocaleTimeString()}] Pipeline listeners initialized.`
    ]);

    const interval = setInterval(() => {
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      setTerminalLogs(prev => [
        ...prev.slice(-6),
        `[${new Date().toLocaleTimeString()}] ${randomAction}`
      ]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isGl]);

  if (!isGl) {
    // Premium 2D Fallback Dashboard
    return (
      <div className="h-screen w-full bg-[#030712] text-white pt-16 px-6 pb-6 overflow-y-auto lg:overflow-hidden select-none">
        
        {/* Top telemetry banner */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center border border-white/5 bg-slate-900/35 backdrop-blur-md rounded-2xl p-4 gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              DEALFLOW<span className="text-teal-400">.OS</span>
              <span className="text-[10px] font-extrabold uppercase bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded border border-teal-400/30 animate-pulse">
                Lite 2D Cockpit Active
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
              Autonomous Systems Management Dashboard
            </p>
          </div>
          <div className="flex gap-4 text-xs font-mono">
            <div className="bg-slate-950/60 border border-white/5 px-3 py-1.5 rounded-xl">
              <span className="text-slate-500 mr-2">SYS TIME:</span>
              <span className="text-slate-300 font-bold">{new Date(data.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="bg-slate-950/60 border border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-emerald-400 font-bold">STABLE</span>
            </div>
          </div>
        </div>

        {/* 3-Column Tactical Cockpit Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-190px)] overflow-y-auto lg:overflow-hidden pb-4">
          
          {/* COLUMN 1: System Telemetry Metrics */}
          <div className="bg-slate-900/20 border border-white/10 backdrop-blur-xl rounded-3xl p-6 flex flex-col justify-between shadow-2xl h-full min-h-[400px]">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-teal-400" />
                  System Telemetry
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">CORE_ENG_V2</span>
              </div>

              {/* Progress Ring for memory */}
              <div className="flex justify-center py-4">
                <div className="relative flex items-center justify-center">
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle cx="72" cy="72" r="60" className="text-slate-950" strokeWidth="8" stroke="currentColor" fill="transparent" />
                    <circle cx="72" cy="72" r="60" className="text-teal-500 transition-all duration-500" strokeWidth="8" strokeDasharray={376.8} strokeDashoffset={376.8 - (376.8 * data.metrics.memoryUsage) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-black text-white">{data.metrics.memoryUsage}%</span>
                    <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Engine Load</span>
                  </div>
                </div>
              </div>

              {/* Memory breakdown details */}
              <div className="space-y-4 font-mono text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Total Heap</span>
                  <span className="text-white font-bold">128 MB</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">GC Collections</span>
                  <span className="text-emerald-400 font-bold">0.4ms avg</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Memory Allocation</span>
                  <span className="text-teal-300 font-bold">Dynamic (LRU)</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-slate-400">Process State</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Activity className="h-3 w-3 animate-pulse" />
                    RUNNING
                  </span>
                </div>
              </div>
            </div>

            {/* Custom SVG telemetry bars */}
            <div className="pt-6 border-t border-white/5">
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-2">Memory Allocation Matrix</label>
              <div className="flex items-end gap-1.5 h-16 bg-slate-950/40 border border-white/5 rounded-xl p-3">
                {[...Array(12)].map((_, i) => {
                  const heights = ["h-3", "h-6", "h-8", "h-5", "h-10", "h-12", "h-7", "h-9", "h-11", "h-6", "h-4", "h-8"];
                  return (
                    <div key={i} className={`flex-1 ${heights[i]} bg-teal-500/20 border-t-2 border-teal-400 rounded-t transition-all`} />
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLUMN 2: Tactical Functional Flow Diagram */}
          <div className="bg-slate-900/20 border border-white/10 backdrop-blur-xl rounded-3xl p-6 flex flex-col justify-between shadow-2xl h-full min-h-[400px] lg:col-span-1">
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-400" />
                  Active Operations Matrix
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">FLOW_VISUAL_2D</span>
              </div>

              {/* Gorgeous animated 2D SVG Flow diagram */}
              <div className="flex-1 flex items-center justify-center py-4">
                <div className="w-full max-w-[280px] space-y-4 font-mono text-[11px]">
                  {[
                    { title: "ICP Website Scraper", desc: "Extracting raw positioning text", color: "border-teal-500/30 text-teal-400" },
                    { title: "Clawpatrol AI Firewall", desc: "Policy checks & threat blocks", color: "border-indigo-500/30 text-indigo-400" },
                    { title: "Hermes Memory System", desc: "4-tier AES encrypted recall", color: "border-violet-500/30 text-violet-400" },
                    { title: "Veritas Compliance Layer", desc: "Context alignment verification", color: "border-emerald-500/30 text-emerald-400" },
                  ].map((node, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-full bg-slate-950/60 border ${node.color} rounded-xl p-3 shadow-md flex items-center gap-3`}>
                        <div className="h-5 w-5 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-400">
                          0{i+1}
                        </div>
                        <div>
                          <div className="font-bold text-white text-[12px]">{node.title}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{node.desc}</div>
                        </div>
                      </div>
                      {i < 3 && (
                        <div className="h-4 w-0.5 border-r border-dashed border-white/20 my-1 animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Endpoint Matrix Panel */}
              <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4">
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="bg-white/5 p-1 border border-white/10 text-slate-500 font-black">ENDPOINT</div>
                  <div className="bg-white/5 p-1 border border-white/10 text-slate-500 font-black">PROTOCOL</div>
                  <div className="p-1">/api/v1/ingest</div><div className="p-1 text-teal-400 font-bold">gRPC/JSON</div>
                  <div className="p-1">/api/v1/query</div><div className="p-1 text-teal-400 font-bold">WebSocket</div>
                  <div className="p-1">/api/v1/audit</div><div className="p-1 text-teal-400 font-bold">HTTPS</div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3: Operator Registry & System Logs */}
          <div className="bg-slate-900/20 border border-white/10 backdrop-blur-xl rounded-3xl p-6 flex flex-col justify-between shadow-2xl h-full min-h-[400px]">
            <div className="space-y-6 h-full flex flex-col">
              
              {/* Connected components panel */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Database className="h-4 w-4 text-violet-400" />
                    Integrity Metrics
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">INTEGRITY_CHECK</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold text-white">Pinecone Vector DB</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">CONNECTED</span>
                  </div>
                  <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold text-white">Metadata Firestore Index</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">PASSED</span>
                  </div>
                </div>
              </div>

              {/* Active Operators list */}
              <div className="space-y-3">
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block border-b border-white/5 pb-1">
                  Active Operators ({data.users.length > 0 ? data.users.length : 4})
                </label>
                <div className="space-y-2 overflow-y-auto max-h-[140px] pr-1">
                  {(data.users.length > 0 ? data.users.slice(0, 3) : [
                    { id: "1", name: "Admin System", role: "Superuser", lastSeen: "Now" },
                    { id: "2", name: "Integration Bot", role: "Automation", lastSeen: "Now" },
                    { id: "3", name: "Security Auditor", role: "Compliance", lastSeen: "Now" }
                  ]).map((user, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/[0.02] p-2.5 border border-white/5 rounded-xl text-xs">
                      <div>
                        <div className="font-bold text-white">{user.name}</div>
                        <div className="text-[9px] text-teal-400 uppercase font-bold tracking-wider mt-0.5">{user.role}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-emerald-400 block">● Active</span>
                        <span className="text-[9px] text-slate-500 mt-0.5 block">{user.lastSeen || "Now"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Console logs */}
              <div className="flex-1 flex flex-col justify-end">
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-2 flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-slate-400" />
                  Live Event Monitor
                </label>
                <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 font-mono text-[10px] text-slate-300 space-y-1.5 h-[120px] overflow-hidden flex flex-col justify-end">
                  {terminalLogs.map((log, i) => (
                    <div key={i} className="truncate select-text">
                      <span className="text-teal-400">{">"}</span> {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-transparent">
      <Canvas shadows dpr={dpr}>
        <PerformanceMonitor 
          onIncline={() => { setDpr(2); setPerformance('high'); }} 
          onDecline={() => { setDpr(1); setPerformance('low'); }} 
        />
        {performance === 'low' && <BakeShadows />}
        
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={5} 
          maxDistance={25}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
          autoRotate={performance === 'high'}
          autoRotateSpeed={0.5}
        />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#8b5cf6" castShadow={performance === 'high'} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2.5} color="#6366f1" />
        <pointLight position={[0, -5, 5]} intensity={1} color="#4f46e5" />
        
        {performance === 'high' && (
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        )}
        
        {/* Components */}
        <group rotation={[0, -Math.PI / 6, 0]}>
          <SystemMetrics position={[-6, 2, 0]} memoryUsage={data.metrics.memoryUsage} />
          <UserRegistry position={[6, 3, 0]} users={data.users} />
          <FunctionalFlow position={[0, -4, 0]} performance={performance} />
          <MarketingElements position={[0, 0, -5]} />
          
          <DataPanel position={[-6, -2, 2]} title="API INTERFACE MATRIX" width="250px">
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-white/5 p-1 border border-white/10 text-slate-400">ENDPOINT</div>
              <div className="bg-white/5 p-1 border border-white/10 text-slate-400">PROTOCOL</div>
              <div className="p-1">/api/v1/ingest</div><div className="p-1 text-teal-400">gRPC/JSON</div>
              <div className="p-1">/api/v1/query</div><div className="p-1 text-teal-400">WebSocket</div>
              <div className="p-1">/api/v1/audit</div><div className="p-1 text-teal-400">HTTPS</div>
            </div>
          </DataPanel>

          <DataPanel position={[6, -2, 2]} title="INTEGRITY VALIDATION" width="250px">
            <div className="space-y-2">
              <div className={`flex items-center gap-2 ${data.metrics.vector.health.pinecone ? 'text-emerald-400' : 'text-red-400'} text-xs`}>
                <span className={`w-2 h-2 rounded-full ${data.metrics.vector.health.pinecone ? 'bg-emerald-500' : 'bg-red-500'}`} />
                Vector Storage: {data.metrics.vector.health.pinecone ? 'CONNECTED' : 'FAILED'}
              </div>
              <div className={`flex items-center gap-2 ${data.metrics.vector.health.firestore ? 'text-emerald-400' : 'text-red-400'} text-xs`}>
                <span className={`w-2 h-2 rounded-full ${data.metrics.vector.health.firestore ? 'bg-emerald-500' : 'bg-red-500'}`} />
                Metadata Index: {data.metrics.vector.health.firestore ? 'PASSED' : 'FAILED'}
              </div>
              <div className="bg-black/40 p-2 rounded font-mono text-[9px] text-slate-500 border border-white/5">
                [{data.timestamp}] Integrity check complete.
              </div>
            </div>
          </DataPanel>
        </group>

        {performance === 'high' && (
          <ContactShadows position={[0, -6, 0]} opacity={0.4} scale={20} blur={2.4} far={4.5} />
        )}
      </Canvas>

      {/* Overlay for interaction */}
      <div className="absolute top-10 left-10 pointer-events-none">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter drop-shadow-xl">
          DEALFLOW<span className="text-teal-500">.OS</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm font-medium tracking-widest uppercase mt-2">
          Autonomous Systems Management
        </p>
      </div>

      <div className="absolute bottom-10 right-10 flex gap-4">
        <button className="pointer-events-auto px-6 py-3 bg-teal-600/90 backdrop-blur-md text-white rounded-full font-bold hover:bg-teal-500 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] border border-teal-400/30">
          Book Live System Demo
        </button>
      </div>
    </div>
  );
}

