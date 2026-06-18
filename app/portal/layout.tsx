"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GlassPanel, Loader3D, Magnetic, ExtrudedButton } from "@/components/immersive";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: currentUser, isLoading } = useCurrentUser();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Auth guard: redirect unauthenticated users to the correct login page
  useEffect(() => {
    if (isLoading) return; // Wait until user state is resolved

    const currentPath = pathname || "";

    // Determine if the current path is a login/public page
    const isLoginPage =
      currentPath === "/portal" ||
      currentPath === "/portal/admin/login" ||
      currentPath === "/portal/customer/login" ||
      currentPath === "/portal/agent/login";

    if (!currentUser && !isLoginPage) {
      // Redirect to the appropriate login based on path
      if (currentPath.startsWith("/portal/admin")) {
        router.push("/portal/admin/login");
      } else if (currentPath.startsWith("/portal/customer")) {
        router.push("/portal/customer/login");
      } else if (currentPath.startsWith("/portal/agent")) {
        router.push("/portal/agent/login");
      } else {
        router.push("/portal");
      }
    } else {
      setCheckingAccess(false);
    }
  }, [currentUser, isLoading, pathname, router]);

  if (checkingAccess || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] immersive-scene">
        <Loader3D label="Loading portal" />
      </div>
    );
  }

  const navLinks = [
    { href: "/portal/admin", label: "Admin Dashboard", match: "/portal/admin" },
    { href: "/portal/agent", label: "Agent Portal", match: "/portal/agent" },
    { href: "/portal/customer", label: "Customer Portal", match: "/portal/customer" },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)] immersive-scene">
      <GlassPanel depth="front" tilt={false} className="mb-8 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Magnetic>
            <Link href="/portal" className="text-xl font-bold immersive-holo-text">
              DealFlow Portal
            </Link>
          </Magnetic>
          <nav className="flex flex-wrap gap-2" aria-label="Portal navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                className={cn(
                  "immersive-nav-icon-extrude rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  pathname?.startsWith(link.match)
                    ? "text-teal-300 bg-teal-500/15"
                    : "text-slate-400 hover:text-teal-200"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            {currentUser && (
              <span className="text-sm text-slate-400">
                <span className="font-semibold text-slate-200">{currentUser.name}</span>
                <span className="text-slate-500"> · {currentUser.role}</span>
              </span>
            )}
            <ExtrudedButton
              variant="outline"
              size="sm"
              disabled={isLoggingOut}
              onClick={async () => {
                setIsLoggingOut(true);
                try {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.replace("/");
                } catch (e) {
                  console.error("Logout failed:", e);
                  setIsLoggingOut(false);
                }
              }}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </ExtrudedButton>
          </div>
        </div>
      </GlassPanel>
      <main className="relative z-10">{children}</main>
    </div>
  );
}
