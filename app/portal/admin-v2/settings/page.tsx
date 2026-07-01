'use client';

import { Settings, Search, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassPanel } from '@/components/immersive';

export default function AdminV2Settings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-slate-400 mt-2">
            Configure platform settings and preferences
          </p>
        </div>
      </div>

      <div className="text-center py-16">
        <Settings className="h-12 w-12 text-slate-700 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">Settings Page</h3>
        <p className="text-slate-500 mb-4">
          Coming soon! Use the legacy portal to configure settings.
        </p>
        <Button asChild variant="ghost" className="text-slate-400 hover:text-white">
          <a href="/portal/admin">Go to Legacy Portal</a>
        </Button>
      </div>
    </div>
  );
}
