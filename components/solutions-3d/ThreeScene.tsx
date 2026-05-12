"use client";

import { Canvas } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  ContactShadows,
  Stars
} from "@react-three/drei";
import { SystemMetrics } from "./SystemMetrics";
import { UserRegistry } from "./UserRegistry";
import { FunctionalFlow } from "./FunctionalFlow";
import { MarketingElements } from "./MarketingElements";
import { DataPanel } from "./DataPanel";
import { SystemData } from "./useSystemInitialization";

export function ThreeScene({ data }: { data: SystemData }) {
  return (
    <div className="h-screen w-full bg-[#020617]">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={5} 
          maxDistance={25}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#8b5cf6" castShadow />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2.5} color="#6366f1" />
        <pointLight position={[0, -5, 5]} intensity={1} color="#4f46e5" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Components */}
        <group rotation={[0, -Math.PI / 6, 0]}>
          <SystemMetrics position={[-6, 2, 0]} memoryUsage={data.metrics.memoryUsage} />
          <UserRegistry position={[6, 3, 0]} users={data.users} />
          <FunctionalFlow position={[0, -4, 0]} />
          <MarketingElements position={[0, 0, -5]} />
          
          <DataPanel position={[-6, -2, 2]} title="API INTERFACE MATRIX">
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-white/5 p-1 border border-white/10 text-slate-400">ENDPOINT</div>
              <div className="bg-white/5 p-1 border border-white/10 text-slate-400">PROTOCOL</div>
              <div className="p-1">/api/v1/ingest</div><div className="p-1 text-violet-400">gRPC/JSON</div>
              <div className="p-1">/api/v1/query</div><div className="p-1 text-violet-400">WebSocket</div>
              <div className="p-1">/api/v1/audit</div><div className="p-1 text-violet-400">HTTPS</div>
            </div>
          </DataPanel>

          <DataPanel position={[6, -2, 2]} title="INTEGRITY VALIDATION">
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

        <ContactShadows position={[0, -6, 0]} opacity={0.4} scale={20} blur={2.4} far={4.5} />
      </Canvas>

      {/* Overlay for interaction */}
      <div className="absolute top-10 left-10 pointer-events-none">
        <h1 className="text-4xl font-black text-white tracking-tighter">
          DEALFLOW<span className="text-violet-500">.OS</span>
        </h1>
        <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">
          Autonomous Systems Management
        </p>
      </div>

      <div className="absolute bottom-10 right-10 flex gap-4">
        <button className="px-6 py-3 bg-violet-600 text-white rounded-full font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/20">
          Book Live System Demo
        </button>
      </div>
    </div>
  );
}
