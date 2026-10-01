import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bot, FileSearch, GitCompareArrows, PenLine } from "lucide-react";
import { AnalyzePanel } from "@/components/analyze-panel";
import { ComparePanel } from "@/components/compare-panel";
import { GeneratePanel } from "@/components/generate-panel";
import { LexaChat } from "@/components/lexa-chat";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

type View = "analyze" | "compare" | "generate";

function Home() {
  const [view, setView] = useState<View>("analyze");
  const [lexaOpen, setLexaOpen] = useState(false);
  const [docText, setDocText] = useState("");
  const [docName, setDocName] = useState("");

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3 text-accent">
              <img
                src="/aegis-logo.png?v=2"
                alt="Aegis legal AI logo"
                className="size-10 rounded-full bg-white object-contain p-0.5"
              />
              <span className="text-[11px] uppercase tracking-[0.22em]">Aegis</span>
            </div>
            <h1 className="mt-2 max-w-xl font-display text-[clamp(1.8rem,4vw,3.1rem)] leading-[1.05] tracking-[-0.03em]">
              A Secure AI-Based Legal Document Retrieval and Analysis Platform
            </h1>
            <p className="mt-3 max-w-lg text-sm text-muted">
              Clause extraction, signing scores, side-by-side comparison, and grounded Q&A. Documents stay in your session.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {(
              [
                ["analyze", "Analyze", FileSearch],
                ["compare", "Compare", GitCompareArrows],
                ["generate", "Generate", PenLine],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm transition-colors",
                  view === id
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-border text-muted hover:text-fg",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {view === "analyze" && (
          <AnalyzePanel
            onDocumentLoaded={(text, name) => {
              setDocText(text);
              setDocName(name);
            }}
          />
        )}
        {view === "compare" && <ComparePanel />}
        {view === "generate" && <GeneratePanel />}
      </main>

      <footer className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-subtle sm:px-6">
          Informational analysis only — not legal advice. Do not rely on this platform as a substitute for qualified counsel.
        </p>
      </footer>

      {/* Lexa AI toggle button */}
      <button
        type="button"
        onClick={() => setLexaOpen((o) => !o)}
        className={cn(
          "fixed bottom-6 right-6 z-30 flex size-14 items-center justify-center rounded-full shadow-lg transition-all duration-200",
          "hover:scale-105 active:scale-95",
          lexaOpen
            ? "bg-elevated text-fg border border-border"
            : "bg-accent text-accent-fg",
        )}
        title="Toggle Lexa AI"
      >
        <Bot className="size-6" />
      </button>

      {/* Lexa AI side panel */}
      <LexaChat
        open={lexaOpen}
        onClose={() => setLexaOpen(false)}
        documentText={docText}
        documentName={docName}
      />
    </div>
  );
}
