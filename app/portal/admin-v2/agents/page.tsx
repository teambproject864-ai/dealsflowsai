'use client';

import { useState, useEffect } from 'react';
import {
  Bot,
  Plus,
  Search,
  MoreHorizontal,
  UserPlus,
  ShieldCheck,
  Loader2,
  Edit,
  KeyRound,
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
import { collection, query, orderBy, where, onSnapshot } from 'firebase/firestore';
import { getDb } from '@/lib/firebase-client';

export default function AdminV2Agents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time Firestore sync for agents
  useEffect(() => {
    const db = getDb();
    if (!db) {
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users'),
      where('role', '==', 'agent'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const agentsData: any[] = [];
        snapshot.forEach((doc) => {
          agentsData.push({ id: doc.id, ...doc.data() });
        });
        setAgents(agentsData);
        setIsLoading(false);
      },
      (error) => {
        console.error('[Admin Agents] Firestore error:', error);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const filteredAgents = agents.filter((agent) =>
    (agent.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (agent.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Agent Management
          </h1>
          <p className="text-slate-400 mt-2">
            Manage agent accounts, permissions, and performance
          </p>
        </div>
        <Button className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Agent
        </Button>
      </div>

      <GlassPanel className="border border-slate-800">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search agents by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 focus:border-teal-500 text-slate-100 placeholder-slate-500 rounded-xl"
            />
          </div>
        </CardContent>
      </GlassPanel>

      <div className="grid gap-4">
        {filteredAgents.map((agent) => (
          <GlassPanel
            key={agent.id}
            className="border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">
                      {agent.name || 'Unnamed Agent'}
                    </h3>
                    <p className="text-sm text-slate-400">{agent.email}</p>
                    <div className="text-xs text-slate-500 mt-1">
                      Joined:{' '}
                      {agent.createdAt
                        ? new Date(agent.createdAt).toLocaleDateString()
                        : 'Unknown'}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-white"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-900 border-slate-800">
                    <DropdownMenuItem className="text-slate-200 cursor-pointer">
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-200 cursor-pointer">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Agent
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-200 cursor-pointer">
                      <KeyRound className="h-4 w-4 mr-2" />
                      Reset Password
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400 cursor-pointer">
                      Deactivate Account
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </GlassPanel>
        ))}

        {filteredAgents.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Bot className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              No agents found
            </h3>
            <p className="text-slate-500 mb-4">
              Try adjusting your search or add a new agent
            </p>
            <Button
              asChild
              variant="ghost"
              className="text-slate-400 hover:text-white"
            >
              <a href="/portal/admin">Go to Legacy Portal</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}