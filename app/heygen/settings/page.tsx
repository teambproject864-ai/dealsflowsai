"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, CheckCircle, AlertCircle } from "lucide-react";
import { GlassPanel, ExtrudedButton } from "@/components/immersive";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function HeyGenSettings() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("heygen_api_key");
    if (stored) setApiKey(stored);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      localStorage.setItem("heygen_api_key", apiKey);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-100">HeyGen Settings</h1>
        <p className="text-slate-400 mt-2">
          Configure your HeyGen API settings
        </p>
      </div>

      <GlassPanel tilt={false} className="border-slate-700/50">
        <div className="p-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                HeyGen API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your HeyGen API key"
                className="bg-black/20 border-white/10 text-white placeholder-slate-500 font-mono text-sm"
              />
              <p className="text-xs text-slate-500">
                You can find your API key in your HeyGen account settings
              </p>
            </div>

            <div className="flex items-center gap-4">
              <ExtrudedButton
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-teal-200 border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </ExtrudedButton>
              {saved && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  Saved successfully!
                </div>
              )}
            </div>
          </form>
        </div>
      </GlassPanel>

      <div className="mt-8">
        <GlassPanel tilt={false} className="border-yellow-500/30 bg-yellow-500/5">
          <div className="p-6 flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-yellow-400 shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-100">
                Important Note
              </h3>
              <p className="text-yellow-200/80 text-sm mt-1">
                Your API key is stored locally in your browser&apos;s localStorage.
                For production, we recommend implementing server-side storage
                with proper security measures.
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
