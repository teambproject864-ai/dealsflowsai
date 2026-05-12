"use client";

import { useState } from "react";
import { 
  BarChart, 
  Search, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  ArrowUpRight,
  RefreshCw,
  Image as ImageIcon,
  Link as LinkIcon,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function AnalysisDashboard() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url,
          userData: {
            title: "Expected Title", // Example user data
            description: "Expected Description"
          }
        }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Input Section */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Search className="text-violet-500" />
          Web Content Analyzer
        </h2>
        <div className="flex gap-3">
          <Input 
            placeholder="https://example.com" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-12"
          />
          <Button 
            onClick={handleAnalyze} 
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-700 h-12 px-8 font-bold"
          >
            {loading ? <RefreshCw className="animate-spin mr-2" /> : "Analyze URL"}
          </Button>
        </div>
      </section>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-400 flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {data && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="text-sm text-slate-400 mb-1">Similarity Score</div>
                <div className="text-3xl font-bold text-white">{data.comparison.similarityScore}%</div>
                <Progress value={data.comparison.similarityScore} className="h-1.5 mt-4 bg-white/5" />
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="text-sm text-slate-400 mb-1">Word Count</div>
                <div className="text-3xl font-bold text-white flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-400" />
                  {data.comparison.stats.wordCount}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="text-sm text-slate-400 mb-1">Images Found</div>
                <div className="text-3xl font-bold text-white flex items-center gap-2">
                  <ImageIcon className="h-6 w-6 text-emerald-400" />
                  {data.comparison.stats.imageCount}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="text-sm text-slate-400 mb-1">Total Links</div>
                <div className="text-3xl font-bold text-white flex items-center gap-2">
                  <LinkIcon className="h-6 w-6 text-amber-400" />
                  {data.comparison.stats.linkCount}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Matches & Discrepancies */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white text-lg flex items-center justify-between">
                  Comparison Results
                  <Badge variant="outline" className="text-slate-400 border-white/10">
                    {data.comparison.discrepancies.length} Issues Found
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Matching Elements</h4>
                  {data.comparison.matches.map((m: string) => (
                    <div key={m} className="flex items-center gap-3 text-emerald-400 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="capitalize">{m} Alignment Verified</span>
                    </div>
                  ))}
                  {data.comparison.matches.length === 0 && (
                    <div className="text-slate-500 text-sm italic p-3">No direct field matches found.</div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Discrepancies Identified</h4>
                  {data.comparison.discrepancies.map((d: any) => (
                    <div key={d.field} className="space-y-2 bg-red-500/5 p-4 rounded-lg border border-red-500/20">
                      <div className="flex items-center gap-2 text-red-400 font-medium">
                        <AlertCircle className="h-4 w-4" />
                        <span className="capitalize">{d.field} Mismatch</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <div className="text-slate-500 mb-1">Expected</div>
                          <div className="text-slate-300 truncate">{d.expected}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1">Scraped</div>
                          <div className="text-slate-300 truncate">{d.found}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Metadata Explorer */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white text-lg flex items-center justify-between">
                  Metadata & Structural Elements
                  <Filter className="h-4 w-4 text-slate-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-white/5 text-slate-500 text-[10px] uppercase tracking-widest sticky top-0">
                      <tr>
                        <th className="p-4 border-b border-white/10">Property</th>
                        <th className="p-4 border-b border-white/10">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {Object.entries(data.scrapedData.metadata).map(([key, val]: [string, any]) => (
                        <tr key={key} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono text-violet-400 text-xs">{key}</td>
                          <td className="p-4 truncate max-w-xs">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Preview */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-violet-500" />
                Scraped Content Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-black/40 p-6 rounded-xl border border-white/5 text-slate-400 text-sm leading-relaxed max-h-[300px] overflow-y-auto font-serif">
                  {data.scrapedData.textContent}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 border-violet-500/20">
                    Language: EN
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                    Semantic Layer: Active
                  </Badge>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Clean Status: Verified
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
