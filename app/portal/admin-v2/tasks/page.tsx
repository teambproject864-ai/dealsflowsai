'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  Edit,
  Plus,
  Search,
  Trash2,
  Filter,
  Users,
  Loader2,
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
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getDb } from '@/lib/firebase-client';
import { demoTasks } from '@/lib/portal-demo-data';

type TaskStatus = 'todo' | 'in-progress' | 'completed';
type TaskPriority = 'low' | 'medium' | 'high';

export default function AdminV2Tasks() {
  const [tasks, setTasks] = useState(demoTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');

  // Real-time Firestore sync (fallback to demo data if Firestore not available)
  useEffect(() => {
    const db = getDb();
    if (!db) return;

    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firestoreTasks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (firestoreTasks.length > 0) {
          setTasks(firestoreTasks as any);
        }
      },
      (error) => {
        console.error('[Admin Tasks] Firestore error:', error);
      }
    );

    return unsubscribe;
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = (task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, filterStatus, filterPriority]);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'low': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-amber-400 animate-pulse" />;
      case 'todo': return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

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
            Task Management
          </h1>
          <p className="text-slate-400 mt-2">
            Create, edit, and track tasks for your team
          </p>
        </div>
        <Button className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <GlassPanel className="border border-slate-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search tasks by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 focus:border-teal-500 text-slate-100 placeholder-slate-500 rounded-xl"
              />
            </div>
            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="border border-slate-700 text-slate-300">
                    <Filter className="h-4 w-4 mr-2" />
                    Status: {filterStatus === 'all' ? 'All' : filterStatus}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-900 border-slate-800">
                  <DropdownMenuItem onClick={() => setFilterStatus('all')} className="text-slate-200">All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('todo')} className="text-slate-200">To Do</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('in-progress')} className="text-slate-200">In Progress</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('completed')} className="text-slate-200">Completed</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="border border-slate-700 text-slate-300">
                    Priority: {filterPriority === 'all' ? 'All' : filterPriority}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-900 border-slate-800">
                  <DropdownMenuItem onClick={() => setFilterPriority('all')} className="text-slate-200">All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority('high')} className="text-slate-200">High</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority('medium')} className="text-slate-200">Medium</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority('low')} className="text-slate-200">Low</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </GlassPanel>

      <div className="grid gap-4">
        {filteredTasks.map((task) => (
          <GlassPanel key={task.id} className="border border-slate-800 hover:border-slate-700 transition-colors">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    {getStatusIcon(task.status as TaskStatus)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-100">{task.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority as TaskPriority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{task.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        Assigned: {task.assignedAgentId || 'Unassigned'}
                      </span>
                      <span>
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </GlassPanel>
        ))}
        {filteredTasks.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Clock className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No tasks found</h3>
            <p className="text-slate-500 mb-4">Try adjusting your filters or create a new task</p>
            <Button asChild variant="ghost" className="text-slate-400 hover:text-white">
              <a href="/portal/admin">Legacy Portal</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
