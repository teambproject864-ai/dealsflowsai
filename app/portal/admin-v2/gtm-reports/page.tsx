'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  FileText,
  Plus,
  Search,
  Download,
  Filter,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassPanel } from '@/components/immersive';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getDb } from '@/lib/firebase-client';
import { demoGTMReports } from '@/lib/portal-demo-data';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function AdminV2GTMReports() {
  const [reports, setReports] = useState(demoGTMReports);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFrequency, setFilterFrequency] = useState<string>('all');

  // Real-time sync
  useEffect(() => {
    const db = getDb();
    if (!db) return;

    const q = query(collection(db, 'gtm-reports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firestoreReports = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (firestoreReports.length > 0) {
          setReports(firestoreReports as any);
        }
      },
      (error) => console.error('[Admin GTM Reports] Firestore error:', error)
    );

    return unsubscribe;
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch = report.reportName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFrequency = filterFrequency === 'all' || report.reportFrequency === filterFrequency;
      return matchesSearch && matchesFrequency;
    });
  }, [reports, searchQuery, filterFrequency]);

  const exportReport = (report: any) => {
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${report.reportName}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            GTM Reports
          </h1>
          <p className="text-slate-400 mt-2">
            Generate, analyze, and export go-to-market strategy reports
          </p>
        </div>
        <Button className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      <GlassPanel className="border border-slate-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 focus:border-teal-500 text-slate-100 placeholder-slate-500 rounded-xl"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="border border-slate-700 text-slate-300">
                  <Filter className="h-4 w-4 mr-2" />
                  Frequency: {filterFrequency === 'all' ? 'All' : filterFrequency}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-900 border-slate-800">
                <DropdownMenuItem onClick={() => setFilterFrequency('all')} className="text-slate-200">All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterFrequency('daily')} className="text-slate-200">Daily</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterFrequency('weekly')} className="text-slate-200">Weekly</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterFrequency('monthly')} className="text-slate-200">Monthly</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </GlassPanel>

      <div className="grid gap-4">
        {filteredReports.map((report) => (
          <GlassPanel key={report.id} className="border border-slate-800 hover:border-slate-700 transition-colors">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1 p-3 bg-gradient-to-br from-teal-600/20 to-blue-600/20 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-100 mb-2">{report.reportName}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <GlassPanel className="border border-slate-800 p-3">
                        <span className="text-xs text-slate-500 block mb-1">Lead Conversion</span>
                        <span className="text-xl font-bold text-teal-400">{report.leadConversionRate}%</span>
                      </GlassPanel>
                      <GlassPanel className="border border-slate-800 p-3">
                        <span className="text-xs text-slate-500 block mb-1">Market Penetration</span>
                        <span className="text-xl font-bold text-blue-400">{report.marketPenetration}%</span>
                      </GlassPanel>
                      <GlassPanel className="border border-slate-800 p-3">
                        <span className="text-xs text-slate-500 block mb-1">Pipeline Value</span>
                        <span className="text-xl font-bold text-amber-400">${report.pipelineValue.toLocaleString()}</span>
                      </GlassPanel>
                      <GlassPanel className="border border-slate-800 p-3">
                        <span className="text-xs text-slate-500 block mb-1">Campaign Effectiveness</span>
                        <span className="text-xl font-bold text-green-400">{report.campaignEffectiveness}%</span>
                      </GlassPanel>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span>Frequency: <span className="text-teal-400 font-semibold">{report.reportFrequency}</span></span>
                      <span>Region: {report.region}</span>
                      <span>Segment: {report.segment}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Created: {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-white"
                  onClick={() => exportReport(report)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </GlassPanel>
        ))}
        {filteredReports.length === 0 && (
          <div className="text-center py-16">
            <BarChart3 className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No reports found</h3>
            <p className="text-slate-500 mb-4">Try adjusting your filters or create a new report</p>
          </div>
        )}
      </div>
    </div>
  );
}
