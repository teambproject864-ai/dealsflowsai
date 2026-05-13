"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Copy, Download } from "lucide-react";

interface Email {
  subject: string;
  body: string;
  timing: string;
}

export function EmailSequenceGenerator() {
  const [sequence, setSequence] = useState<Email[] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateSequence = () => {
    const generatedSequence: Email[] = [
      {
        subject: "Quick question about your sales process",
        body: "Hi [Name],\n\nI noticed you're in [Industry] and I was curious about how you're currently handling your sales outreach.\n\nWould you be open to a 15-minute call to discuss how DealFlow AI could help you streamline your process?\n\nBest,\n[Your Name]",
        timing: "Day 1 - Immediately"
      },
      {
        subject: "Following up on our conversation",
        body: "Hi [Name],\n\nJust following up on my previous email. I'd love to hear your thoughts on how DealFlow AI could help your team.\n\nAre you available for a quick call this week?\n\nBest,\n[Your Name]",
        timing: "Day 3 - Follow-up"
      },
      {
        subject: "How [Company] could benefit from AI",
        body: "Hi [Name],\n\nBased on your company profile, I think DealFlow AI could help you increase your close rate by up to 30%.\n\nWould you like to see a quick demo?\n\nBest,\n[Your Name]",
        timing: "Day 7 - Value proposition"
      },
      {
        subject: "Last attempt to connect",
        body: "Hi [Name],\n\nI wanted to reach out one last time. If you're still interested in learning about DealFlow AI, let me know!\n\nOtherwise, I'll leave you be. Have a great week!\n\nBest,\n[Your Name]",
        timing: "Day 14 - Final follow-up"
      },
      {
        subject: "Check-in - How's everything going?",
        body: "Hi [Name],\n\nIt's been a while! Just wanted to check in and see how things are going with your sales process.\n\nIf you're still looking for solutions, I'd be happy to chat.\n\nBest,\n[Your Name]",
        timing: "Day 30 - Nurture"
      }
    ];
    setSequence(generatedSequence);
  };

  const copyToClipboard = (index: number, email: Email) => {
    const text = `Subject: ${email.subject}\n\n${email.body}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadSequence = () => {
    if (!sequence) return;
    const content = sequence.map((email, i) => 
      `Email ${i + 1} - ${email.timing}\nSubject: ${email.subject}\n\n${email.body}\n\n---\n`
    ).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email-sequence.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        <CardHeader>
          <CardTitle className="text-2xl">Email Sequence Generator</CardTitle>
          <CardDescription>
            Generate personalized email sequences based on your intake data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={generateSequence}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            Generate Email Sequence
          </Button>

          {sequence && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-end">
                <Button onClick={downloadSequence} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download Sequence
                </Button>
              </div>
              {sequence.map((email, index) => (
                <Card key={index} className="border border-white/5 bg-white/5">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardDescription>{email.timing}</CardDescription>
                        <CardTitle className="text-lg">{email.subject}</CardTitle>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(index, email)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        {copiedIndex === index ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans">
                      {email.body}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
