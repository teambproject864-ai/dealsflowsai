"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, Users, Pause, Play } from "lucide-react";

interface Activity {
  id: string;
  type: "booking" | "lead";
  company: string;
  timestamp: Date;
}

const companyNames = [
  "Acme Corp", "TechStart Inc", "SalesFlow Solutions", 
  "InnovateCo", "GrowthHub", "Pipeline Pros",
  "DealMakers", "Revenue Rocket", "CloseFast"
];

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState<"all" | "booking" | "lead">("all");

  const generateActivity = (): Activity => {
    const type = Math.random() > 0.5 ? "booking" as const : "lead" as const;
    const company = companyNames[Math.floor(Math.random() * companyNames.length)];
    return {
      id: Date.now().toString(),
      type,
      company,
      timestamp: new Date()
    };
  };

  useEffect(() => {
    const initialActivities: Activity[] = Array.from({ length: 5 }, () => generateActivity());
    setActivities(initialActivities);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      const newActivity = generateActivity();
      setActivities(prev => [newActivity, ...prev].slice(0, 20));
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const filteredActivities = filter === "all" 
    ? activities 
    : activities.filter(a => a.type === filter);

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-400" />
            Live Activity Feed
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <Button
            variant={filter === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-violet-600" : ""}
          >
            All
          </Button>
          <Button
            variant={filter === "booking" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("booking")}
            className={filter === "booking" ? "bg-violet-600" : ""}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Bookings
          </Button>
          <Button
            variant={filter === "lead" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("lead")}
            className={filter === "lead" ? "bg-violet-600" : ""}
          >
            <Users className="mr-2 h-4 w-4" />
            Leads
          </Button>
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {filteredActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5"
            >
              <div className={`h-2 w-2 rounded-full ${activity.type === "booking" ? "bg-emerald-400" : "bg-violet-400"} animate-pulse`} />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {activity.type === "booking" ? "Demo booked" : "Qualified lead"} at {activity.company}
                </p>
                <p className="text-xs text-muted-foreground">{getTimeAgo(activity.timestamp)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
