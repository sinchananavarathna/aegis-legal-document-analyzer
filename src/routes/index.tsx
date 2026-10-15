
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bot,
  FileSearch,
  GitCompareArrows,
  PenLine,
  Scale,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  X,
  LockKeyhole,
  Mail,
  UserRound,
  CheckCircle2,
} from "lucide-react";
import { AnalyzePanel } from "@/components/analyze-panel";
import { ComparePanel } from "@/components/compare-panel";
import { GeneratePanel } from "@/components/generate-panel";
import { LexaChat } from "@/components/lexa-chat";
import { cn } from "@/lib/utils";
import { authClient, authEnabled, signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/")({ component: Home });

type View = "analyze" | "compare" | "generate";
type AuthMode = "login" | "signup";

function Home() {
  const [view, setView] = useState<View>("analyze");
  const [lexaOpen, setLexaOpen] = useState(false);
  const [docText, setDocText] = useState("");
  const [docName, setDocName] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const { user, isPending: userPending } = useCurrentUserState();

  const tabs = [
    { id: "analyze" as const, label: "Analyze", icon: FileSearch },
    { id: "compare" as const, label: "Compare", icon: GitCompareArrows },
    { id: "generate" as const, label: "Draft", icon: PenLine },
  ];

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setAuthError("");
    setAuthOpen(true);
  }

  return (
    <div className="aegis-page min-h-dvh overflow-hidden bg-bg text-fg">
      <div className="aegis-orb aegis-orb-one" />
      <div className="aegis-orb aegis-orb-two" />

      <header className="relative z-10 border-b border-border/80 bg-bg/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex shrink-0 items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 shadow-lg shadow-black/20">
              <img
                src="/aegis-logo.png?v=2"
                alt="Aegis logo"
                className="size-9 rounded-xl object-contain"
              />
            </div>
            <div>
              <p className="font-display text-2xl leading-none tracking-wide">AEGIS</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-muted">
                Legal intelligence
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-1 rounded-full border border-border bg-surface/80 p-1 sm:flex">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm transition-all duration-200",
                  view === id
                    ? "bg-accent text-accent-fg shadow-md"
                    : "text-muted hover:bg-elevated hover:text-fg",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </nav>

          {authEnabled && user ? (
            <div className="flex items-center gap-3">
              <span className="hidden max-w-40 truncate text-sm text-muted md:inline">
                {user.displayName ?? user.primaryEmail ?? "Account"}
              </span>
              <button
                type="button"
                onClick={() => void signOut().catch(() => openAuth("login"))}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm transition hover:border-accent/50"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuth("login")}
              disabled={userPending}
              className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/10 disabled:opacity-60"
            >
              {userPending ? "Checking…" : "Sign in"} <ArrowRight className="size-4" />
            </button>
          )}
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 pb-3 sm:hidden">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm",
                view === id
                  ? "border-accent bg-accent text-accent-fg"
                  : "border-border text-muted",
              )}
            >
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <section className="relative mb-9 overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-surface via-surface to-[#202720] p-6 sm:p-10 lg:p-12">
          <div className="absolute -right-16 -top-24 size-72 rounded-full border border-accent/10" />
          <div className="absolute -right-5 -top-12 size-52 rounded-full border border-accent/10" />
          <div className="absolute bottom-0 right-0 h-1/2 w-1/2 bg-gradient-to-tl from-accent/10 to-transparent" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs text-accent">
                <span className="size-1.5 animate-pulse rounded-full bg-accent" />
                A smarter way to work with legal documents
              </div>

              <h1 className="font-display text-4xl leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
                Clarity in every clause.
                <span className="mt-1 block italic text-accent">
                  Confidence in every decision.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-muted sm:text-base">
                Analyze contracts, compare documents, and create structured
                drafts from one focused workspace. Your legal workflow, made
                clearer.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setView("analyze");
                    document.getElementById("workspace")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-fg transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/10"
                >
                  Open workspace <ArrowRight className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => openAuth("signup")}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-5 py-3 text-sm transition hover:border-accent/50 hover:bg-white/[0.06]"
                >
                  Create free account
                </button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="size-4 text-accent" /> Session-focused workflow
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-accent" /> Three focused tools
                </span>
              </div>
            </div>

            <div className="relative mx-auto hidden h-64 w-full max-w-sm items-center justify-center lg:flex">
              <div className="absolute size-56 rounded-full border border-accent/15" />
              <div className="absolute size-44 rounded-full border border-dashed border-accent/25 aegis-spin" />
              <div className="relative flex size-36 items-center justify-center rounded-[2rem] border border-accent/30 bg-[#202720] shadow-2xl shadow-black/40">
                <Scale className="size-16 text-accent" strokeWidth={1.1} />
              </div>

              <div className="aegis-float absolute left-0 top-7 rounded-2xl border border-border bg-elevated/95 p-3 shadow-xl">
                <FileSearch className="size-5 text-accent" />
                <p className="mt-2 text-[10px] text-muted">Document analysis</p>
              </div>
              <div className="aegis-float-delayed absolute bottom-5 right-0 rounded-2xl border border-border bg-elevated/95 p-3 shadow-xl">
                <ShieldCheck className="size-5 text-accent" />
                <p className="mt-2 text-[10px] text-muted">Privacy in focus</p>
              </div>
              <div className="absolute right-3 top-0 rounded-full border border-accent/20 bg-accent/10 p-3">
                <Sparkles className="size-4 text-accent" />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: FileSearch,
              number: "01",
              title: "Analyze",
              description: "Extract clauses and inspect contract details.",
              id: "analyze" as const,
            },
            {
              icon: GitCompareArrows,
              number: "02",
              title: "Compare",
              description: "Review differences between documents.",
              id: "compare" as const,
            },
            {
              icon: PenLine,
              number: "03",
              title: "Draft",
              description: "Create structured legal document drafts.",
              id: "generate" as const,
            },
          ].map(({ icon: Icon, number, title, description, id }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setView(id);
                document.getElementById("workspace")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className={cn(
                "group rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl hover:shadow-black/20",
                view === id
                  ? "border-accent/40 bg-accent/[0.07]"
                  : "border-border bg-surface/75",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent transition group-hover:scale-105">
                  <Icon className="size-5" />
                </div>
                <span className="font-mono text-xs text-subtle">{number}</span>
              </div>
              <h2 className="mt-4 font-display text-2xl">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
              <div className="mt-4 flex items-center gap-1 text-xs text-accent">
                Open tool <ArrowRight className="size-3 transition group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </section>

        <section id="workspace" className="scroll-mt-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-accent">
                Your workspace
              </p>
              <h2 className="mt-1 font-display text-3xl">
                {view === "analyze"
                  ? "Document analysis"
                  : view === "compare"
                    ? "Document comparison"
                    : "Legal drafting"}
              </h2>
            </div>
            <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted">
              {view === "analyze"
                ? "Clause intelligence"
                : view === "compare"
                  ? "Side-by-side review"
                  : "Drafting tools"}
            </span>
          </div>

          <div className="aegis-panel rounded-2xl border border-border bg-surface/90 p-1 sm:p-2">
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
          </div>
        </section>

        <section className="mt-10 flex flex-col gap-4 rounded-2xl border border-accent/20 bg-accent/[0.05] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-accent/10 p-2.5 text-accent">
              <Bot className="size-5" />
            </div>
            <div>
              <h3 className="font-medium">Meet Lexa, your AI assistant</h3>
              <p className="mt-1 text-sm text-muted">
                Open the assistant to explore the existing chat experience.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLexaOpen(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-accent/30 px-4 py-2.5 text-sm transition hover:bg-accent/10"
          >
            Open Lexa <ArrowRight className="size-4" />
          </button>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border bg-surface/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Aegis Legal Intelligence</span>
          <span>Informational analysis only — not legal advice.</span>
        </div>
      </footer>

      <button
        type="button"
        onClick={() => setLexaOpen((open) => !open)}
        className={cn(
          "fixed bottom-5 right-5 z-30 flex size-14 items-center justify-center rounded-2xl shadow-xl transition-all duration-200 hover:-translate-y-1 active:scale-95",
          lexaOpen
            ? "border border-border bg-elevated text-fg"
            : "bg-accent text-accent-fg shadow-accent/20",
        )}
        title="Toggle Lexa AI"
        aria-label="Toggle Lexa AI assistant"
      >
        {lexaOpen ? <X className="size-5" /> : <Bot className="size-6" />}
      </button>

      <LexaChat
        open={lexaOpen}
        onClose={() => setLexaOpen(false)}
        documentText={docText}
        documentName={docName}
      />

      {authOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAuthOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            className="aegis-modal relative my-auto w-full max-w-md rounded-[2rem] border border-border bg-[#141714] p-6 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={() => setAuthOpen(false)}
              aria-label="Close account dialog"
              className="absolute right-5 top-5 rounded-full border border-border p-2 text-muted transition hover:text-fg"
            >
              <X className="size-4" />
            </button>

            <div className="mb-6 flex size-12 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
              <Scale className="size-6" />
            </div>

            <p className="text-[10px] uppercase tracking-[0.25em] text-accent">
              Aegis account
            </p>
            <h2 id="auth-title" className="mt-2 font-display text-4xl">
              {authMode === "login" ? "Welcome back." : "Join Aegis."}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {authMode === "login"
                ? "Sign in to access your saved legal documents."
                : "Create an account to keep your documents and analyses across sessions."}
            </p>

            <form
              className="mt-7 space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                if (authBusy) return;
                setAuthBusy(true);
                setAuthError("");
                const form = new FormData(event.currentTarget);
                const name = String(form.get("name") ?? "").trim();
                const email = String(form.get("email") ?? "").trim();
                const password = String(form.get("password") ?? "");
                try {
                  const response = authMode === "signup"
                    ? await authClient.signUp.email({ name, email, password })
                    : await authClient.signIn.email({ email, password });
                  if (response.error) {
                    throw new Error(response.error.message || "Authentication failed. Please try again.");
                  }
                  setAuthOpen(false);
                  setAuthError("");
                } catch (error) {
                  setAuthError(error instanceof Error ? error.message : "Authentication failed. Please try again.");
                } finally {
                  setAuthBusy(false);
                }
              }}
            >
              {authMode === "signup" && (
                <label className="block">
                  <span className="mb-2 block text-xs text-muted">Full name</span>
                  <span className="flex items-center gap-3 rounded-xl border border-border bg-black/20 px-3">
                    <UserRound className="size-4 text-muted" />
                    <input
                      name="name"
                      required
                      autoComplete="name"
                      placeholder="Your name"
                      className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-subtle"
                    />
                  </span>
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-xs text-muted">Email address</span>
                <span className="flex items-center gap-3 rounded-xl border border-border bg-black/20 px-3 transition focus-within:border-accent/60">
                  <Mail className="size-4 text-muted" />
                  <input
                    name="email"
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-subtle"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs text-muted">Password</span>
                <span className="flex items-center gap-3 rounded-xl border border-border bg-black/20 px-3 transition focus-within:border-accent/60">
                  <LockKeyhole className="size-4 text-muted" />
                  <input
                    name="password"
                    required
                    type="password"
                    autoComplete={
                      authMode === "login" ? "current-password" : "new-password"
                    }
                    minLength={8}
                    placeholder="At least 8 characters"
                    className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-subtle"
                  />
                </span>
              </label>

              <button
                type="submit"
                disabled={authBusy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-semibold text-accent-fg transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
              >
                {authBusy ? "Please wait…" : authMode === "login" ? "Sign in" : "Create account"}
                {!authBusy ? <ArrowRight className="size-4" /> : null}
              </button>
            </form>

            {authError && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-sm leading-5 text-red-300"
              >
                {authError}
              </p>
            )}

            <p className="mt-5 text-center text-sm text-muted">
              {authMode === "login" ? "New to Aegis?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "signup" : "login");
                  setAuthError("");
                }}
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                {authMode === "login" ? "Create an account" : "Sign in"}
              </button>
            </p>

            <p className="mt-5 text-center text-[11px] leading-5 text-subtle">
              Your account uses secure password authentication. Never share your password.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
