"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, Building, Briefcase, Award, Save, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { ExtrudedButton, GlassPanel, SunkenInput } from "@/components/immersive";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  role: string;
}

const DEFAULT_PROFILE: ProfileData = {
  name: "Praneeth Burada",
  email: "praneeth@dealflow.ai",
  phone: "+1 978-915-8244",
  company: "Dealflow.AI",
  title: "GTM Architect",
  role: "RevOps",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem("dealflow_user_profile");
    if (cached) {
      try {
        setProfile(JSON.parse(cached));
      } catch (err) {
        console.error("Failed to parse cached profile:", err);
      }
    }
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!profile.name.trim()) newErrors.name = "Full name is required";
    if (!profile.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      newErrors.email = "Invalid email format";
    }
    if (!profile.company.trim()) newErrors.company = "Company is required";
    if (!profile.title.trim()) newErrors.title = "Job title is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSaved(false);

    // Simulate network save latency
    setTimeout(() => {
      localStorage.setItem("dealflow_user_profile", JSON.stringify(profile));
      setLoading(false);
      setSaved(true);
      // Fade out success banner after 4 seconds
      setTimeout(() => setSaved(false), 4000);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-background text-foreground relative py-12 px-4 z-10 flex flex-col justify-center">
      <div className="mx-auto max-w-2xl w-full">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to GTM Cockpit
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <GlassPanel material="glass" className="border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden rounded-3xl p-0" tilt={false}>
            {/* Glassmorphic header details */}
            <div className="bg-gradient-to-r from-teal-500/10 via-violet-500/5 to-transparent border-b border-slate-200 dark:border-white/5 px-8 py-6 flex items-center gap-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-teal-400 to-violet-500 p-0.5 flex items-center justify-center shadow-lg shadow-teal-500/10">
                <div className="h-full w-full rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-teal-600 dark:text-teal-400 text-2xl font-black">
                  {profile.name.split(" ").map(w => w[0]).join("")}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight sm:text-2xl font-display">{profile.name}</h2>
                <p className="text-xs text-teal-600 dark:text-teal-300 font-semibold uppercase tracking-wider mt-1">{profile.title} @ {profile.company}</p>
              </div>
            </div>

            <div className="px-8 pt-6 pb-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile Workspace</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                Update your administrative details and define your role to customize pipeline analytics outputs.
              </p>
            </div>

            <div className="px-8 pb-8 pt-4">
              {/* Success Notification */}
              <AnimatePresence>
                {saved && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 rounded-xl border border-emerald-300 dark:border-emerald-500/20 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center gap-3"
                  >
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-semibold">Workspace profile updated and saved persistently!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      Full Name
                    </label>
                    <SunkenInput
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className={errors.name ? "border-red-500/50 focus-visible:ring-red-500" : ""}
                    />
                    {errors.name && <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      Contact Email
                    </label>
                    <SunkenInput
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className={errors.email ? "border-red-500/50 focus-visible:ring-red-500" : ""}
                    />
                    {errors.email && <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      Phone Number
                    </label>
                    <SunkenInput
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>

                  {/* GTM Role */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Award className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      GTM Operating Role
                    </label>
                    <select
                      value={profile.role}
                      onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:focus:ring-teal-400/50 transition-all cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                    >
                      <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="RevOps">Revenue Operations (RevOps)</option>
                      <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="Sales">Sales Account Executive</option>
                      <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="Marketing">Growth Specialist / Marketing</option>
                      <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="Exec">Executive Leader</option>
                    </select>
                  </div>

                  {/* Company Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Building className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      Company Name
                    </label>
                    <SunkenInput
                      type="text"
                      value={profile.company}
                      onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                      className={errors.company ? "border-red-500/50 focus-visible:ring-red-500" : ""}
                    />
                    {errors.company && <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">{errors.company}</p>}
                  </div>

                  {/* Job Title */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      Job Title
                    </label>
                    <SunkenInput
                      type="text"
                      value={profile.title}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      className={errors.title ? "border-red-500/50 focus-visible:ring-red-500" : ""}
                    />
                    {errors.title && <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">{errors.title}</p>}
                  </div>

                </div>

                {/* Submit Action */}
                <div className="flex justify-end border-t border-slate-200 dark:border-white/5 pt-6 mt-6">
                  <ExtrudedButton
                    type="submit"
                    disabled={loading}
                    className="min-w-[160px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white mr-2" />
                        Saving changes...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Profile
                      </>
                    )}
                  </ExtrudedButton>
                </div>
              </form>
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </main>
  );
}

