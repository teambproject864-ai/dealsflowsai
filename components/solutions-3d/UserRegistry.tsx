"use client";

import { DataPanel } from "./DataPanel";

export function UserRegistry({ position, users }: { position: [number, number, number], users: any[] }) {
  const displayUsers = users.length > 0 ? users.slice(0, 4) : [
    { name: "Admin System", role: "Superuser", status: "Active", time: "2m ago" },
    { name: "Integration Bot", role: "Automation", status: "Idle", time: "15m ago" },
    { name: "Security Auditor", role: "Compliance", status: "Active", time: "Now" },
    { name: "Lead Processor", role: "Logic", status: "Active", time: "1m ago" },
  ];

  return (
    <DataPanel position={position} title="REGISTERED OPERATORS">
      <div className="space-y-3">
        {displayUsers.map((user, i) => (
          <div key={i} className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
            <div>
              <div className="font-medium text-white">{user.name}</div>
              <div className="text-[10px] text-violet-300 uppercase tracking-wider">{user.role}</div>
            </div>
            <div className="text-right">
              <div className={`text-[10px] ${user.status === 'Active' || !user.status ? 'text-emerald-400' : 'text-slate-400'}`}>
                ● {user.status || 'Active'}
              </div>
              <div className="text-[10px] text-slate-500">{user.time || user.lastSeen ? new Date(user.lastSeen).toLocaleTimeString() : 'N/A'}</div>
            </div>
          </div>
        ))}
      </div>
    </DataPanel>
  );
}
