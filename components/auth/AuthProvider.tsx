"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/lib/auth";

interface AuthProviderProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export default function AuthProvider({
  allowedRoles,
  children,
}: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const currentPath = pathname || "";
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (data.success && allowedRoles.includes(data.user.role)) {
          setIsAuthenticated(true);
        } else {
          // Determine which login page to redirect to based on pathname
          let role: UserRole = "agent";
          if (currentPath.includes("/admin")) role = "admin";
          else if (currentPath.includes("/customer")) role = "customer";
          
          router.push(`/portal/${role}/login?redirect=${encodeURIComponent(currentPath)}`);
        }
      } catch (e) {
        let role: UserRole = "agent";
        if (currentPath.includes("/admin")) role = "admin";
        else if (currentPath.includes("/customer")) role = "customer";
        
        router.push(`/portal/${role}/login?redirect=${encodeURIComponent(currentPath)}`);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect happens via router.push
  }

  return <>{children}</>;
}
