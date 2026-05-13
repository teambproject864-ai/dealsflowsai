"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export function ROICalculator() {
  const [numReps, setNumReps] = useState<string>("");
  const [avgDealSize, setAvgDealSize] = useState<string>("");
  const [closeRate, setCloseRate] = useState<string>("");
  const [results, setResults] = useState<{ monthly: number; annual: number } | null>(null);

  const calculateROI = () => {
    const reps = parseFloat(numReps);
    const dealSize = parseFloat(avgDealSize);
    const rate = parseFloat(closeRate) / 100;

    if (!reps || !dealSize || !rate || rate < 0 || rate > 1) return;

    const monthly = reps * 2 * dealSize * rate;
    const annual = monthly * 12;

    setResults({ monthly, annual });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        <CardHeader>
          <CardTitle className="text-2xl">ROI Calculator</CardTitle>
          <CardDescription>
            Calculate your projected revenue lift with DealFlow AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numReps">Number of Sales Reps</Label>
              <Input
                id="numReps"
                type="number"
                min="1"
                value={numReps}
                onChange={(e) => setNumReps(e.target.value)}
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avgDealSize">Average Deal Size (USD)</Label>
              <Input
                id="avgDealSize"
                type="number"
                min="0"
                step="0.01"
                value={avgDealSize}
                onChange={(e) => setAvgDealSize(e.target.value)}
                placeholder="5000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closeRate">Close Rate (%)</Label>
              <Input
                id="closeRate"
                type="number"
                min="0"
                max="100"
                value={closeRate}
                onChange={(e) => setCloseRate(e.target.value)}
                placeholder="20"
              />
            </div>
          </div>

          <Button
            onClick={calculateROI}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            Calculate ROI
          </Button>

          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4"
            >
              <Card className="border border-violet-500/30 bg-violet-500/10">
                <CardHeader className="pb-2">
                  <CardDescription>Monthly Projected Lift</CardDescription>
                  <CardTitle className="text-3xl text-violet-300">
                    ${results.monthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border border-emerald-500/30 bg-emerald-500/10">
                <CardHeader className="pb-2">
                  <CardDescription>Annual Projected Lift</CardDescription>
                  <CardTitle className="text-3xl text-emerald-300">
                    ${results.annual.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </CardTitle>
                </CardHeader>
              </Card>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
