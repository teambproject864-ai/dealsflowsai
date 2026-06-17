"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { ExtrudedButton } from "@/components/immersive";

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <ExtrudedButton
      variant="outline"
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4 mr-2" />
      )}
      {isLoggingOut ? "Logging out" : "Logout"}
    </ExtrudedButton>
  );
}
