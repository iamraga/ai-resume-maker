"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

const placeholderMessages = [
  {
    id: "m1",
    role: "assistant",
    content:
      "Hello! Upload your resume or paste content here, and I can help rewrite bullet points or suggest improvements.",
  },
];

export function ChatPanel() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(placeholderMessages);

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: input.trim() },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "AI responses will appear here once the backend is wired up.",
      },
    ]);
    setInput("");
  }

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card">
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-lg border px-4 py-3 text-sm ${
                message.role === "assistant"
                  ? "bg-muted text-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSend} className="border-t p-4">
        <Textarea
          placeholder="Ask for help with a bullet, summary, or skill..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="mb-3 h-24 resize-none"
        />
        <div className="flex justify-end">
          <Button type="submit">Send</Button>
        </div>
      </form>
    </div>
  );
}
