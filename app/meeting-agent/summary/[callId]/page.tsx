"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase-client";
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Send } from "lucide-react";

export default function CallSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const callId = params.callId as string;

  const [call, setCall] = useState<any>(null);
  const [lead, setLead] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const callDoc = await getDoc(doc(db, "calls", callId));
      if (!callDoc.exists()) return;
      const cData = callDoc.data();
      setCall(cData);

      const [lDoc, sSnapshot] = await Promise.all([
        getDoc(doc(db, "leads", cData.leadId)),
        getDocs(query(
          collection(db, "summaries"), 
          where("callId", "==", callId),
          where("type", "==", "post-call"),
          orderBy("sentAt", "desc"),
          limit(1)
        ))
      ]);

      if (lDoc.exists()) setLead(lDoc.data());
      if (!sSnapshot.empty) setSummary(sSnapshot.docs[0].data());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [callId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      await fetch("/api/notifications/post-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId }),
      });
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-8 gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Call Summary</h1>
          <p className="text-muted-foreground">Meeting with {lead?.companyName}</p>
        </div>
        {!summary && (
          <Button onClick={handleGenerateSummary} disabled={isGenerating} className="gap-2">
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Generate Summary Now
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="p-4 bg-slate-50 border-none">
          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Company</label>
          <p className="font-bold">{lead?.companyName}</p>
        </Card>
        <Card className="p-4 bg-slate-50 border-none">
          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Final Status</label>
          <Badge className="capitalize">{call?.dealStatus || "In Progress"}</Badge>
        </Card>
        <Card className="p-4 bg-slate-50 border-none">
          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Deal Probability</label>
          <p className="font-bold text-xl text-primary">{call?.dealProbability}%</p>
        </Card>
      </div>

      {summary ? (
        <Card className="p-8 shadow-lg border-slate-200">
          <div className="prose prose-slate max-w-none">
            <div className="flex justify-between items-center mb-6 pb-6 border-b">
              <span className="text-sm text-muted-foreground">Sent to {summary.sentTo?.join(", ")}</span>
              <span className="text-sm text-muted-foreground">
                {new Date(summary.sentAt).toLocaleDateString()} at {new Date(summary.sentAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
              {summary.content}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center border-dashed border-2">
          <p className="text-muted-foreground">No summary has been generated for this call yet.</p>
        </Card>
      )}
    </div>
  );
}
