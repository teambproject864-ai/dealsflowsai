"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function BookDemoRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/?step=5#intake");
  }, [router]);

  return (
    <main className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500 mx-auto" />
        <p className="text-muted-foreground">Redirecting to booking...</p>
      </div>
    </main>
  );
}
