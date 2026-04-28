import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import { FlowProgress } from "@/components/FlowProgress";

export default function AnalysisPage() {
  return (
    <main className="min-h-screen pb-20">
      <FlowProgress current={1} />
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:pt-14">
        <AnalysisDashboard />
      </div>
    </main>
  );
}
