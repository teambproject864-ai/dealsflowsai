'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Bot,
  ClipboardList,
  FolderOpen,
  FileText,
  BarChart3,
  Phone,
  MessageSquare,
  Settings,
  Bell,
  Menu,
  X,
  ChevronRight,
  LogOut,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassPanel } from '@/components/immersive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AuthProvider from '@/components/auth/AuthProvider';
import LogoutButton from '@/components/auth/LogoutButton';

// Navigation items
const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/portal/admin-v2',
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Users,
    href: '/portal/admin-v2/customers',
  },
  {
    id: 'agents',
    label: 'Agents',
    icon: Bot,
    href: '/portal/admin-v2/agents',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: ClipboardList,
    href: '/portal/admin-v2/tasks',
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FolderOpen,
    href: '/portal/admin-v2/documents',
  },
  {
    id: 'gtm-reports',
    label: 'GTM Reports',
    icon: FileText,
    href: '/portal/admin-v2/gtm-reports',
  },
  {
    id: 'llm-manager',
    label: 'LLM Manager',
    icon: BarChart3,
    href: '/portal/admin-v2/llm-manager',
  },
  {
    id: 'bot-monitor',
    label: 'Bot Monitor',
    icon: Phone,
    href: '/portal/admin-v2/bot-monitor',
  },
  {
    id: 'interactions',
    label: 'Interactions',
    icon: MessageSquare,
    href: '/portal/admin-v2/interactions',
  },
  {
    id: 'password-requests',
    label: 'Password Requests',
    icon: KeyRound,
    href: '/portal/admin-v2/password-requests',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/portal/admin-v2/settings',
  },
];

export default function AdminV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New feedback from John Doe', type: 'info' },
    { id: 2, message: 'Agent Ashok completed task #42', type: 'success' },
  ]);

  // Determine active tab from current URL (simplified)
  useEffect(() => {
    const path = window.location.pathname;
    const item = navigationItems.find(nav => path.includes(nav.id) || nav.href === path);
    if (item) setActiveTab(item.id);
  }, []);

  return (
    <AuthProvider allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        {/* Header */}
        <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-slate-800 transition-colors lg:hidden"
                >
                  <Menu className="h-5 w-5 text-slate-300" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                      DealFlow Admin
                    </h1>
                    <p className="text-xs text-slate-500 hidden sm:block">
                      Intelligent GTM Platform
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Button variant="ghost" className="relative">
                    <Bell className="h-5 w-5 text-slate-300" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </Button>
                </div>
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        <div className="flex max-w-[1600px] mx-auto">
          {/* Sidebar */}
          <aside className={cn(
            "fixed lg:static z-30 h-[calc(100vh-4rem)] w-64 bg-slate-900 border-r border-slate-800 transition-all duration-300",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20"
          )}>
            <nav className="h-full py-6 px-3 overflow-y-auto">
              <ul className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <Link href={item.href} className={cn(
                        "group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                        activeTab === item.id
                          ? "bg-gradient-to-r from-teal-600/20 to-blue-600/20 border border-teal-500/30 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                      )}>
                        <Icon className={cn("h-5 w-5 flex-shrink-0", activeTab === item.id ? "text-teal-400" : "")} />
                        <span className={cn(
                          "text-sm font-medium transition-opacity duration-200",
                          !sidebarOpen && "lg:hidden"
                        )}>
                          {item.label}
                        </span>
                        {activeTab === item.id && (
                          <ChevronRight className={cn(
                            "h-4 w-4 ml-auto transition-opacity duration-200",
                            !sidebarOpen && "lg:hidden"
                          )} />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className={cn(
                "mt-8 pt-6 border-t border-slate-800",
                !sidebarOpen && "lg:hidden"
              )}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">
                  Quick Links
                </p>
                <ul className="space-y-1">
                  <li>
                    <Link href="/portal/admin" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors">
                      <div className="h-4 w-4 border border-dashed border-slate-600 rounded" />
                      <span>Legacy Portal</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
