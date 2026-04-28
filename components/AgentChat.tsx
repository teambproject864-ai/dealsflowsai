"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Sparkles } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function AgentChat({ callId }: { callId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial message from AI
    const startChat = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callId,
            message: "Hello! Introduce yourself as Praneeth Assist, a Senior GTM Manager at DealFlow.ai. Welcome the user and briefly mention you're here to dive into their strategy and show how DealFlow.ai delivers 2X impact. Mention their scheduled demo call time if available.",
            history: [],
          }),
        });
        const data = await res.json();
        if (data.response) {
          setMessages([
            {
              id: "1",
              role: "assistant",
              content: data.response,
            },
          ]);
        }
      } catch (error) {
        console.error("Error starting chat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    startChat();
  }, [callId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callId,
          message: input,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (data.response) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.response,
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full border-x border-white/10">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-violet-500/50">
            <AvatarFallback className="bg-violet-600 text-white">PA</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-white">Praneeth Assist</h2>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online · Senior GTM Manager @ DealFlow.ai
            </p>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-violet-600 text-white rounded-tr-none"
                      : "bg-white/10 text-gray-200 rounded-tl-none border border-white/5"
                  }`}
                >
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/10 text-gray-200 rounded-2xl rounded-tl-none border border-white/5 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-white/10 bg-black/20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white/5 border-white/10 focus:border-violet-500/50 h-12 pr-12 rounded-xl"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-1.5 h-9 w-9 p-0 bg-violet-600 hover:bg-violet-700 rounded-lg"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        <p className="mt-3 text-[10px] text-center text-muted-foreground uppercase tracking-widest">
          Powered by DealFlow.ai Intelligence
        </p>
      </div>
    </div>
  );
}
