"use client";

import { useEffect, useState } from "react";
import { Settings, ToggleLeft, ToggleRight, Bell, Shield, Sliders, Save, CheckCircle, ArrowLeft, Loader2, Key, Database, RefreshCw, Volume2 } from "lucide-react";
import { ExtrudedButton, GlassPanel, SunkenInput } from "@/components/immersive";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SettingsData {
  theme: string;
  timezone: string;
  salesforceActive: boolean;
  salesforceToken: string;
  hubspotActive: boolean;
  hubspotToken: string;
  clayActive: boolean;
  clayToken: string;
  twilioActive: boolean;
  twilioToken: string;
  smsAlerts: boolean;
  emailDigest: boolean;
  soundAlerts: boolean;
  mfaActive: boolean;
}

const DEFAULT_SETTINGS: SettingsData = {
  theme: "dark",
  timezone: "Asia/Kolkata",
  salesforceActive: true,
  salesforceToken: "sf_token_live_839a9c8b82",
  hubspotActive: false,
  hubspotToken: "",
  clayActive: true,
  clayToken: "clay_prod_key_77a729",
  twilioActive: false,
  twilioToken: "",
  smsAlerts: true,
  emailDigest: true,
  soundAlerts: false,
  mfaActive: false,
};

type TabType = "general" | "integrations" | "notifications" | "security";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password fields for security tab
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: ""
  });

  // Load from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem("dealflow_user_settings");
    if (cached) {
      try {
        setSettings(JSON.parse(cached));
      } catch (err) {
        console.error("Failed to parse cached settings:", err);
      }
    }
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate tokens if integrations are toggled on
    if (settings.salesforceActive && !settings.salesforceToken.trim()) {
      newErrors.salesforceToken = "Salesforce API token is required when active";
    }
    if (settings.hubspotActive && !settings.hubspotToken.trim()) {
      newErrors.hubspotToken = "HubSpot API token is required when active";
    }
    if (settings.clayActive && !settings.clayToken.trim()) {
      newErrors.clayToken = "Clay API token is required when active";
    }
    if (settings.twilioActive && !settings.twilioToken.trim()) {
      newErrors.twilioToken = "Twilio Authentication token is required when active";
    }

    // Validate security passwords if touched
    if (passwords.current || passwords.newPass || passwords.confirm) {
      if (!passwords.current) newErrors.current = "Current password is required to make changes";
      if (!passwords.newPass) {
        newErrors.newPass = "New password is required";
      } else if (passwords.newPass.length < 6) {
        newErrors.newPass = "Password must be at least 6 characters";
      }
      if (passwords.newPass !== passwords.confirm) {
        newErrors.confirm = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSaved(false);

    // Simulate saving settings
    setTimeout(() => {
      localStorage.setItem("dealflow_user_settings", JSON.stringify(settings));
      setLoading(false);
      setSaved(true);
      setPasswords({ current: "", newPass: "", confirm: "" }); // reset passwords
      setTimeout(() => setSaved(false), 4000);
    }, 1200);
  };

  const tabs: Array<{ id: TabType; label: string; icon: any }> = [
    { id: "general", label: "General Workspace", icon: Sliders },
    { id: "integrations", label: "Integrations & APIs", icon: Database },
    { id: "notifications", label: "Notification Rules", icon: Bell },
    { id: "security", label: "Access & Security", icon: Shield },
  ];

  return (
    <main className="min-h-screen bg-dealflow-blue text-white relative py-12 px-4 z-10 flex flex-col justify-center">
      <div className="mx-auto max-w-3xl w-full">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-teal-400 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to GTM Cockpit
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl font-display flex items-center gap-3 bg-gradient-to-r from-teal-300 to-violet-300 bg-clip-text text-transparent">
              <Settings className="text-teal-400 h-8 w-8" />
              Settings Configuration
            </h1>
            <p className="text-slate-400 text-sm">
              Configure GTM system integrations, define operational alerts, and secure access protocols.
            </p>
          </div>

          {/* Persistent Save Banner */}
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-300 flex items-center gap-3"
              >
                <CheckCircle className="h-5 w-5 shrink-0" />
                <span className="text-sm font-semibold">Settings preferences updated and compiled persistently!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setErrors({});
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-semibold transition-all relative ${
                    activeTab === tab.id
                      ? "text-teal-400 bg-white/5 border border-white/10 border-b-transparent"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="settings-tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <GlassPanel material="glass" className="border border-white/10 shadow-2xl rounded-3xl overflow-hidden p-8" tilt={false}>
              <AnimatePresence mode="wait">
                {/* GENERAL TAB */}
                {activeTab === "general" && (
                  <motion.div
                    key="general"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">General Workspace Prefs</h3>
                      <p className="text-xs text-slate-400">Establish local workspace themes and localization.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Theme Selection */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Workspace Theme</label>
                        <select
                          value={settings.theme}
                          onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                          className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50 transition-all cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                        >
                          <option value="dark">Deep Ocean Dark (Default)</option>
                          <option value="cyberpunk">Cyberpunk Neon</option>
                          <option value="light">Classic Light Workspace</option>
                        </select>
                      </div>

                      {/* Timezone */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">System Timezone</label>
                        <select
                          value={settings.timezone}
                          onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                          className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50 transition-all cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                        >
                          <option value="UTC">UTC / Coordinated Universal Time</option>
                          <option value="America/New_York">EST (America / New York)</option>
                          <option value="Europe/London">GMT/BST (Europe / London)</option>
                          <option value="Asia/Kolkata">IST (Asia / Kolkata)</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* INTEGRATIONS TAB */}
                {activeTab === "integrations" && (
                  <motion.div
                    key="integrations"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">Integrations &amp; CRM Sync</h3>
                      <p className="text-xs text-slate-400">Connect CRM suites and operational platforms to establish continuous pipeline loading.</p>
                    </div>

                    <div className="space-y-6">
                      {/* Salesforce */}
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400">
                              <Database className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white">Salesforce CRM Integration</h4>
                              <p className="text-[11px] text-slate-400">Synchronize client accounts and pipeline opportunities automatically.</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, salesforceActive: !settings.salesforceActive })}
                            className="focus:outline-none transition-transform active:scale-95 text-teal-400"
                          >
                            {settings.salesforceActive ? (
                              <ToggleRight className="h-10 w-10 text-teal-400" />
                            ) : (
                              <ToggleLeft className="h-10 w-10 text-slate-500" />
                            )}
                          </button>
                        </div>

                        {settings.salesforceActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="pt-2 space-y-2"
                          >
                            <label className="text-[11px] font-semibold text-slate-300">Salesforce API Access Token</label>
                            <SunkenInput
                              type="password"
                              value={settings.salesforceToken}
                              onChange={(e) => {
                                setSettings({ ...settings, salesforceToken: e.target.value });
                                if (errors.salesforceToken) setErrors({ ...errors, salesforceToken: "" });
                              }}
                              className={cn(
                                errors.salesforceToken && "border-red-500/40 focus-visible:ring-red-500"
                              )}
                              placeholder="Enter Salesforce consumer API token"
                            />
                            {errors.salesforceToken && <p className="text-[10px] text-red-400">{errors.salesforceToken}</p>}
                          </motion.div>
                        )}
                      </div>

                      {/* HubSpot */}
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/25 text-orange-400">
                              <Database className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white">HubSpot CRM Integration</h4>
                              <p className="text-[11px] text-slate-400">Sync contacts, deals, and engagement history logs.</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, hubspotActive: !settings.hubspotActive })}
                            className="focus:outline-none transition-transform active:scale-95 text-teal-400"
                          >
                            {settings.hubspotActive ? (
                              <ToggleRight className="h-10 w-10 text-teal-400" />
                            ) : (
                              <ToggleLeft className="h-10 w-10 text-slate-500" />
                            )}
                          </button>
                        </div>

                        {settings.hubspotActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="pt-2 space-y-2"
                          >
                            <label className="text-[11px] font-semibold text-slate-300">HubSpot API Access Key</label>
                            <SunkenInput
                              type="password"
                              value={settings.hubspotToken}
                              onChange={(e) => {
                                setSettings({ ...settings, hubspotToken: e.target.value });
                                if (errors.hubspotToken) setErrors({ ...errors, hubspotToken: "" });
                              }}
                              className={cn(
                                errors.hubspotToken && "border-red-500/40 focus-visible:ring-red-500"
                              )}
                              placeholder="Enter HubSpot private app key"
                            />
                            {errors.hubspotToken && <p className="text-[10px] text-red-400">{errors.hubspotToken}</p>}
                          </motion.div>
                        )}
                      </div>

                      {/* Clay */}
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/25 text-violet-400">
                              <Database className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white">Clay Enrichment Sync</h4>
                              <p className="text-[11px] text-slate-400">Enrich scheduled leads with company size, funding, and tech stack details.</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, clayActive: !settings.clayActive })}
                            className="focus:outline-none transition-transform active:scale-95 text-teal-400"
                          >
                            {settings.clayActive ? (
                              <ToggleRight className="h-10 w-10 text-teal-400" />
                            ) : (
                              <ToggleLeft className="h-10 w-10 text-slate-500" />
                            )}
                          </button>
                        </div>

                        {settings.clayActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="pt-2 space-y-2"
                          >
                            <label className="text-[11px] font-semibold text-slate-300">Clay API Enrichment Token</label>
                            <SunkenInput
                              type="password"
                              value={settings.clayToken}
                              onChange={(e) => {
                                setSettings({ ...settings, clayToken: e.target.value });
                                if (errors.clayToken) setErrors({ ...errors, clayToken: "" });
                              }}
                              className={cn(
                                errors.clayToken && "border-red-500/40 focus-visible:ring-red-500"
                              )}
                              placeholder="Enter Clay credential token"
                            />
                            {errors.clayToken && <p className="text-[10px] text-red-400">{errors.clayToken}</p>}
                          </motion.div>
                        )}
                      </div>

                      {/* Twilio */}
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400">
                              <Database className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white">Twilio Outbound Voice/SMS</h4>
                              <p className="text-[11px] text-slate-400">Trigger outbound scheduling confirmation texts and voice reminders.</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, twilioActive: !settings.twilioActive })}
                            className="focus:outline-none transition-transform active:scale-95 text-teal-400"
                          >
                            {settings.twilioActive ? (
                              <ToggleRight className="h-10 w-10 text-teal-400" />
                            ) : (
                              <ToggleLeft className="h-10 w-10 text-slate-500" />
                            )}
                          </button>
                        </div>

                        {settings.twilioActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="pt-2 space-y-2"
                          >
                            <label className="text-[11px] font-semibold text-slate-300">Twilio Auth Token</label>
                            <SunkenInput
                              type="password"
                              value={settings.twilioToken}
                              onChange={(e) => {
                                setSettings({ ...settings, twilioToken: e.target.value });
                                if (errors.twilioToken) setErrors({ ...errors, twilioToken: "" });
                              }}
                              className={cn(
                                errors.twilioToken && "border-red-500/40 focus-visible:ring-red-500"
                              )}
                              placeholder="Enter Twilio production auth token"
                            />
                            {errors.twilioToken && <p className="text-[10px] text-red-400">{errors.twilioToken}</p>}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* NOTIFICATIONS TAB */}
                {activeTab === "notifications" && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">Operational Alerts &amp; Digests</h3>
                      <p className="text-xs text-slate-400">Establish automated notification rules across systems.</p>
                    </div>

                    <div className="space-y-4">
                      {/* SMS Booking Alerts */}
                      <label className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-slate-950/20 hover:bg-white/[0.04] hover:border-teal-500/20 transition-all cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.smsAlerts}
                          onChange={(e) => setSettings({ ...settings, smsAlerts: e.target.checked })}
                          className="rounded border-white/10 bg-slate-950/50 text-teal-400 focus:ring-teal-500 h-4.5 w-4.5"
                        />
                        <div>
                          <span className="text-sm font-bold block">SMS Scheduled Call Alerts</span>
                          <span className="text-xs text-slate-400">Receive SMS notifications as soon as new strategy calls are locked.</span>
                        </div>
                      </label>

                      {/* Email Daily Digest */}
                      <label className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-slate-950/20 hover:bg-white/[0.04] hover:border-teal-500/20 transition-all cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.emailDigest}
                          onChange={(e) => setSettings({ ...settings, emailDigest: e.target.checked })}
                          className="rounded border-white/10 bg-slate-950/50 text-teal-400 focus:ring-teal-500 h-4.5 w-4.5"
                        />
                        <div>
                          <span className="text-sm font-bold block">Email Strategy Daily Digest</span>
                          <span className="text-xs text-slate-400">Get a daily summarized operations report of active pipeline deals and win rate percentages.</span>
                        </div>
                      </label>

                      {/* Sound Alerts */}
                      <label className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-slate-950/20 hover:bg-white/[0.04] hover:border-teal-500/20 transition-all cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.soundAlerts}
                          onChange={(e) => setSettings({ ...settings, soundAlerts: e.target.checked })}
                          className="rounded border-white/10 bg-slate-950/50 text-teal-400 focus:ring-teal-500 h-4.5 w-4.5"
                        />
                        <div className="flex items-center gap-2 flex-1 justify-between">
                          <div>
                            <span className="text-sm font-bold block">System Sound Notifications</span>
                            <span className="text-xs text-slate-400">Trigger custom audio feedback tones on intake submissions or immediate agent boot events.</span>
                          </div>
                          <Volume2 className="h-5 w-5 text-slate-500" />
                        </div>
                      </label>
                    </div>
                  </motion.div>
                )}

                {/* SECURITY TAB */}
                {activeTab === "security" && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">Access Credentials &amp; MFA</h3>
                      <p className="text-xs text-slate-400">Secure credential access and add extra protection layers.</p>
                    </div>

                    <div className="space-y-6">
                      {/* MFA */}
                      <div className="p-4 rounded-2xl bg-slate-950/20 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/25 text-teal-400">
                            <Shield className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">Multi-Factor Authentication (MFA)</h4>
                            <p className="text-[11px] text-slate-400">Enhance platform security by enforcing multi-factor codes on logon.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, mfaActive: !settings.mfaActive })}
                          className="focus:outline-none transition-transform active:scale-95"
                        >
                          {settings.mfaActive ? (
                            <ToggleRight className="h-10 w-10 text-teal-400" />
                          ) : (
                            <ToggleLeft className="h-10 w-10 text-slate-500" />
                          )}
                        </button>
                      </div>

                      {/* Password Reset */}
                      <div className="p-6 rounded-2xl bg-slate-950/20 border border-white/5 space-y-4">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Key className="h-4 w-4 text-teal-400" />
                          Modify Workspace Password
                        </h4>

                        <div className="grid grid-cols-1 gap-4">
                          {/* Current Password */}
                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-400">Current Security Password</label>
                            <SunkenInput
                              type="password"
                              value={passwords.current}
                              onChange={(e) => {
                                setPasswords({ ...passwords, current: e.target.value });
                                if (errors.current) setErrors({ ...errors, current: "" });
                              }}
                              className={cn(
                                errors.current && "border-red-500/40 focus-visible:ring-red-500"
                              )}
                              placeholder="••••••••"
                            />
                            {errors.current && <p className="text-[10px] text-red-400">{errors.current}</p>}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* New Password */}
                            <div className="space-y-1">
                              <label className="text-[11px] text-slate-400">New Password</label>
                              <SunkenInput
                                type="password"
                                value={passwords.newPass}
                                onChange={(e) => {
                                  setPasswords({ ...passwords, newPass: e.target.value });
                                  if (errors.newPass) setErrors({ ...errors, newPass: "" });
                                }}
                                className={cn(
                                  errors.newPass && "border-red-500/40 focus-visible:ring-red-500"
                                )}
                                placeholder="Min 6 characters"
                              />
                              {errors.newPass && <p className="text-[10px] text-red-400">{errors.newPass}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1">
                              <label className="text-[11px] text-slate-400">Confirm New Password</label>
                              <SunkenInput
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) => {
                                  setPasswords({ ...passwords, confirm: e.target.value });
                                  if (errors.confirm) setErrors({ ...errors, confirm: "" });
                                }}
                                className={cn(
                                  errors.confirm && "border-red-500/40 focus-visible:ring-red-500"
                                )}
                                placeholder="••••••••"
                              />
                              {errors.confirm && <p className="text-[10px] text-red-400">{errors.confirm}</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Save Trigger Button */}
              <div className="flex justify-end border-t border-white/5 pt-6 mt-8">
                <ExtrudedButton
                  type="submit"
                  disabled={loading}
                  className="min-w-[200px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white mr-2" />
                      Saving settings...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </ExtrudedButton>
              </div>
            </GlassPanel>
          </form>
        </motion.div>
      </div>
    </main>
  );
}

