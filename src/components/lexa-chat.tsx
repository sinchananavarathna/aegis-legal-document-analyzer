import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lexaChat } from "@/lib/legal/ai";
import { cn } from "@/lib/utils";

type LexaMessage = { role: "user" | "assistant"; content: string };

export function LexaChat({
  open,
  onClose,
  documentText,
  documentName,
}: {
  open: boolean;
  onClose: () => void;
  documentText: string;
  documentName: string;
}) {
  const [messages, setMessages] = useState<LexaMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasDoc = documentText.trim().length > 0;

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;

    setInput("");
    setError(null);
    const userMsg: LexaMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setBusy(true);

    try {
      const res = await lexaChat({
        data: {
          messages: [...messages, userMsg],
          documentText,
          documentName,
        },
      });
      if (res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: res.text }]);
      } else {
        setError(res.error);
      }
    } catch {
      setError("Lexa could not respond. Try again.");
    } finally {
      setBusy(false);
    }
  }, [input, busy, messages, documentText, documentName]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <>
      {/* Backdrop */}
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={onClose}
        />
      ) : null}

      {/* Panel */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-surface shadow-[var(--shadow-panel)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "sm:w-[420px]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-accent/15">
            <Bot className="size-4 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-fg">Lexa AI</p>
            <p className="text-[11px] text-subtle">
              {hasDoc ? `Analyzing: ${documentName}` : "No document loaded"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-[var(--radius-sm)] text-muted hover:bg-elevated hover:text-fg transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && !busy ? (
            <div className="flex h-full flex-col items-center justify-center text-center px-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-accent/10">
                <Bot className="size-6 text-accent" />
              </div>
              <p className="mt-4 text-sm font-medium text-fg">Ask Lexa anything</p>
              <p className="mt-1 text-xs text-muted max-w-[260px]">
                {hasDoc
                  ? "Lexa will answer based on the currently loaded document."
                  : "Load a document in the Analyze tab first, then ask Lexa to review it."}
              </p>
              {hasDoc && (
                <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                  {["What are the key risks?", "Summarize the obligations", "Who are the parties?"].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setInput(q)}
                      className="rounded-full border border-border px-3 py-1 text-[11px] text-muted hover:border-accent hover:text-accent transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[92%] rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "ml-auto bg-accent text-accent-fg"
                    : "bg-elevated text-fg",
                )}
              >
                {m.content}
              </div>
            ))
          )}
          {busy ? (
            <div className="flex items-center gap-2 text-muted text-sm">
              <Loader2 className="size-3.5 animate-spin" />
              Lexa is thinking...
            </div>
          ) : null}
          {error ? (
            <div className="rounded-[var(--radius-sm)] border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
              {error}
            </div>
          ) : null}
        </div>

        {/* Input */}
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-end gap-2 rounded-[var(--radius-md)] border border-border bg-bg p-2 focus-within:border-accent/50 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={hasDoc ? "Ask about this document..." : "Load a document first..."}
              className="flex-1 resize-none bg-transparent text-sm text-fg placeholder:text-subtle outline-none min-h-[24px] max-h-[120px]"
              style={{ fieldSizing: "content" }}
              disabled={!hasDoc}
            />
            <Button
              size="icon"
              variant="ghost"
              className="size-8 shrink-0"
              onClick={() => void send()}
              disabled={!input.trim() || busy || !hasDoc}
            >
              <Send className="size-3.5" />
            </Button>
          </div>
          <p className="mt-1.5 text-[10px] text-subtle text-center">
            Lexa is not a lawyer. Verify critical findings.
          </p>
        </div>
      </aside>
    </>
  );
}
