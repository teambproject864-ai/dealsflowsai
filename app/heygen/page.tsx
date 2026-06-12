"use client";

import Link from "next/link";
import { Video, Library, Activity, Settings } from "lucide-react";
import { GlassPanel, ExtrudedButton, StaggerReveal } from "@/components/immersive";

export default function HeyGenLanding() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <StaggerReveal className="space-y-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold mb-4 immersive-holo-text">
            HeyGen Video Generator
          </h1>
          <p className="text-xl text-[#C8B8FF] font-medium">
            Create professional AI videos with HeyGen&apos;s powerful API
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/heygen/create" prefetch={false} className="group">
            <GlassPanel material="glass" depth="mid" tilt={true} className="p-6 h-full flex flex-col justify-between border-slate-700/50 hover:border-teal-500/50 transition-all duration-300">
              <div>
                <Video className="h-12 w-12 text-teal-400 mb-4 drop-shadow-[0_0_8px_rgba(20,184,166,0.3)]" />
                <h3 className="text-2xl font-bold text-slate-100 group-hover:text-teal-400 transition-colors mb-2">
                  Create Video
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Generate a new AI video with custom prompts and avatar selection
                </p>
              </div>
              <ExtrudedButton className="w-full bg-teal-600 hover:bg-teal-700">
                Get Started
              </ExtrudedButton>
            </GlassPanel>
          </Link>

          <Link href="/heygen/library" prefetch={false} className="group">
            <GlassPanel material="glass" depth="mid" tilt={true} className="p-6 h-full flex flex-col justify-between border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
              <div>
                <Library className="h-12 w-12 text-purple-400 mb-4 drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]" />
                <h3 className="text-2xl font-bold text-slate-100 group-hover:text-purple-400 transition-colors mb-2">
                  Video Library
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  View and manage all your generated AI videos
                </p>
              </div>
              <ExtrudedButton className="w-full bg-purple-600 hover:bg-purple-700">
                Browse Library
              </ExtrudedButton>
            </GlassPanel>
          </Link>

          <Link href="/heygen/status" prefetch={false} className="group">
            <GlassPanel material="glass" depth="mid" tilt={true} className="p-6 h-full flex flex-col justify-between border-slate-700/50 hover:border-orange-500/50 transition-all duration-300">
              <div>
                <Activity className="h-12 w-12 text-orange-400 mb-4 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]" />
                <h3 className="text-2xl font-bold text-slate-100 group-hover:text-orange-400 transition-colors mb-2">
                  Status Tracking
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Monitor the progress of your video generation jobs in real-time
                </p>
              </div>
              <ExtrudedButton className="w-full bg-orange-600 hover:bg-orange-700">
                View Status
              </ExtrudedButton>
            </GlassPanel>
          </Link>

          <Link href="/heygen/settings" prefetch={false} className="group">
            <GlassPanel material="glass" depth="mid" tilt={true} className="p-6 h-full flex flex-col justify-between border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
              <div>
                <Settings className="h-12 w-12 text-blue-400 mb-4 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                <h3 className="text-2xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors mb-2">
                  Settings
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Configure HeyGen API settings and preferences
                </p>
              </div>
              <ExtrudedButton className="w-full bg-blue-600 hover:bg-blue-700">
                Open Settings
              </ExtrudedButton>
            </GlassPanel>
          </Link>
        </div>
      </StaggerReveal>
    </div>
  );
}
