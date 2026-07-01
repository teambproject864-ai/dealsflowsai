'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  TrendingUp,
  Bot,
  BarChart3,
  DollarSign,
  Star,
  Activity,
  ClipboardList,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GlassPanel } from '@/components/immersive';
import { demoUsers, demoTasks, demoCustomerFeedback, demoAgentMetrics } from '@/lib/portal-demo-data';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminV2Dashboard() {
  const [llmMetrics, setLlmMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate stats from demo data
  const stats = useMemo(() => {
    const totalAgents = demoUsers.filter(u => u.role === 'agent').length;
    const totalCustomers = demoUsers.filter(u => u.role === 'customer').length;
    const completedTasks = demoTasks.filter(t => t.status === 'completed').length;
    const avgRating = demoCustomerFeedback.length
      ? (demoCustomerFeedback.reduce((sum, f) => sum + f.rating, 0) / demoCustomerFeedback.length).toFixed(1)
      : '0';

    return { totalAgents, totalCustomers, completedTasks, avgRating };
  }, []);

  // Mock recent activity
  const recentActivity = [
    { id: '1', type: 'task', message: 'Agent Ashok completed task #42', time: '2 min ago' },
    { id: '2', type: 'customer', message: 'New customer John Doe onboarded', time: '15 min ago' },
    { id: '3', type: 'feedback', message: 'Customer Acme Corp gave 5-star feedback', time: '1 hour ago' },
    { id: '4', type: 'llm', message: 'LLM processed 128 requests in last 15 mins', time: '2 hours ago' },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-slate-400 mt-2">
            Monitor key metrics, track agent performance, and manage your platform
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
            <Link href="/portal/admin-v2/agents">
              <Users className="h-4 w-4 mr-2" />
              Manage Agents
            </Link>
          </Button>
        </div>
      </div>

      {/* Main stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Agents */}
        <GlassPanel className="border border-slate-800 hover:border-teal-500/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">Total Agents</p>
                  <p className="text-3xl font-bold text-slate-100">{stats.totalAgents}</p>
                </div>
              </div>
              <TrendingUp className="h-5 w-5 text-teal-400" />
            </div>
          </CardContent>
        </GlassPanel>

        {/* Total Customers */}
        <GlassPanel className="border border-slate-800 hover:border-blue-500/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">Total Customers</p>
                  <p className="text-3xl font-bold text-slate-100">{stats.totalCustomers}</p>
                </div>
              </div>
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
          </CardContent>
        </GlassPanel>

        {/* Completed Tasks */}
        <GlassPanel className="border border-slate-800 hover:border-purple-500/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">Completed Tasks</p>
                  <p className="text-3xl font-bold text-slate-100">{stats.completedTasks}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-purple-400">
                <span className="text-sm font-medium">78%</span>
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </GlassPanel>

        {/* Average Rating */}
        <GlassPanel className="border border-slate-800 hover:border-amber-500/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                  <Star className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">Avg. Rating</p>
                  <p className="text-3xl font-bold text-slate-100">{stats.avgRating}</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= parseFloat(stats.avgRating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-700"
                    )}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </GlassPanel>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <GlassPanel className="border border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Activity className="h-5 w-5 text-teal-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-colors">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-2",
                    activity.type === 'task' ? 'bg-teal-500' :
                    activity.type === 'customer' ? 'bg-blue-500' :
                    activity.type === 'feedback' ? 'bg-amber-500' :
                    'bg-purple-500'
                  )} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">{activity.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full justify-center text-slate-400 hover:text-white">
                View All Activity
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </GlassPanel>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <GlassPanel className="border border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <ClipboardList className="h-5 w-5 text-blue-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="ghost" className="w-full justify-start hover:bg-slate-800 text-slate-200">
                <Link href="/portal/admin-v2/customers">
                  <Users className="h-4 w-4 mr-2" />
                  Onboard New Customer
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start hover:bg-slate-800 text-slate-200">
                <Link href="/portal/admin-v2/agents">
                  <Bot className="h-4 w-4 mr-2" />
                  Create New Agent
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start hover:bg-slate-800 text-slate-200">
                <Link href="/portal/admin-v2/llm-manager">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View LLM Metrics
                </Link>
              </Button>
            </CardContent>
          </GlassPanel>

          {/* Task Progress */}
          <GlassPanel className="border border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">Task Completion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Weekly Goal</span>
                  <span className="font-semibold text-teal-400">{stats.completedTasks}/40</span>
                </div>
                <Progress value={75} className="h-2 bg-slate-800" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Agent Productivity</span>
                  <span className="font-semibold text-blue-400">82%</span>
                </div>
                <Progress value={82} className="h-2 bg-slate-800" />
              </div>
            </CardContent>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
