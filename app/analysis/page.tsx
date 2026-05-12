import { AnalysisDashboard } from "@/components/AnalysisDashboard";

export default function AnalysisPage() {
  return (
    <div className="container mx-auto py-12">
      <header className="px-6 mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl mb-4">
          Data <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Comparison Engine</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl">
          Systematically extract and compare web content against your reference datasets. 
          Identify structural discrepancies and semantic alignment in real-time.
        </p>
      </header>

      <AnalysisDashboard />
    </div>
  );
}
