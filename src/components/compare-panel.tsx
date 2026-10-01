import { useState } from "react";
import { GitCompareArrows, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/score-ring";
import { analyzeText, compareAnalyses } from "@/lib/legal/analyzer";
import { SAMPLE_NDA, SAMPLE_RISKY } from "@/lib/legal/samples";
import { compareWithAi } from "@/lib/legal/ai";
import { useAiCooldown } from "@/lib/hooks/ai-cooldown";
import type { ComparisonResult } from "@/lib/legal/types";

export function ComparePanel() {
  const [left, setLeft] = useState(SAMPLE_NDA);
  const [right, setRight] = useState(SAMPLE_RISKY);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiCooldown = useAiCooldown();

  function run() {
    const a = analyzeText(left, "Document A");
    const b = analyzeText(right, "Document B");
    const diff = compareAnalyses(a, b);
    setResult({ doc1: a, doc2: b, ...diff });
    setAiExplanation(null);
    setAiError(null);
  }

  async function onAiCompare() {
    if (!result) return;
    setAiBusy(true);
    setAiError(null);
    try {
      const res = await compareWithAi({
        data: {
          docA: result.doc1.cleanedText,
          docB: result.doc2.cleanedText,
          fileNameA: result.doc1.fileName,
          fileNameB: result.doc2.fileName,
        },
      });
      if (res.ok) {
        setAiExplanation(res.explanation);
        aiCooldown.startCooldown();
      } else {
        setAiError(res.error);
      }
    } catch {
      setAiError("AI comparison could not complete. Try again.");
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <span className="text-[11px] uppercase tracking-[0.16em] text-subtle">Document A</span>
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            rows={12}
            className="mt-3 w-full resize-y rounded-[var(--radius-md)] border border-border bg-bg p-3 font-mono text-xs text-fg outline-none"
          />
        </label>
        <label className="block rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <span className="text-[11px] uppercase tracking-[0.16em] text-subtle">Document B</span>
          <textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            rows={12}
            className="mt-3 w-full resize-y rounded-[var(--radius-md)] border border-border bg-bg p-3 font-mono text-xs text-fg outline-none"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={run} className="w-full sm:w-auto">
          <GitCompareArrows className="size-4" />
          Compare
        </Button>
        {result ? (
          <Button
            variant="outline"
            onClick={() => void onAiCompare()}
            disabled={aiBusy || aiCooldown.isDisabled}
            className="w-full sm:w-auto"
          >
            {aiBusy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            AI Explain Differences
            {aiCooldown.cooldownRemaining > 0 ? ` (${aiCooldown.cooldownRemaining}s)` : ""}
          </Button>
        ) : null}
      </div>

      {result ? (
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-subtle">Overlap</p>
              <p className="font-display text-4xl tabular-nums">{result.similarity}%</p>
              <p className="mt-1 text-sm text-muted">Lexical similarity of significant terms.</p>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <ScoreRing value={result.doc1.signing.percentage} size={108} />
                <p className="mt-2 text-xs text-muted">A · {result.doc1.signing.label}</p>
              </div>
              <div className="text-center">
                <ScoreRing value={result.doc2.signing.percentage} size={108} />
                <p className="mt-2 text-xs text-muted">B · {result.doc2.signing.label}</p>
              </div>
            </div>
          </div>

          {aiError ? <p className="mt-4 text-sm text-danger">{aiError}</p> : null}
          {aiExplanation ? (
            <div className="mt-4 rounded-[var(--radius-md)] border border-accent/40 bg-bg p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-accent">AI Analysis</p>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-fg/90">
                {aiExplanation}
              </div>
            </div>
          ) : null}

          <h3 className="mt-8 text-xs uppercase tracking-[0.16em] text-subtle">Critical differences</h3>
          <ul className="mt-3 space-y-2">
            {result.critical.map((c) => (
              <li key={c.title} className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] border border-border bg-bg p-3">
                <div>
                  <p className="text-sm text-fg">{c.title}</p>
                  <p className="mt-1 text-xs text-muted">{c.detail}</p>
                </div>
                <Badge tone={c.severity === "high" ? "danger" : c.severity === "medium" ? "warn" : "neutral"}>
                  {c.severity}
                </Badge>
              </li>
            ))}
          </ul>

          <h3 className="mt-8 text-xs uppercase tracking-[0.16em] text-subtle">Clause coverage</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-subtle">
                <tr>
                  <th className="py-2 font-medium">Clause</th>
                  <th className="py-2 font-medium">A</th>
                  <th className="py-2 font-medium">B</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.clauseDiff.map((row) => (
                  <tr key={row.name} className="border-t border-border">
                    <td className="py-2 capitalize">{row.name.replaceAll("_", " ")}</td>
                    <td className="py-2 tabular-nums">{row.in1}</td>
                    <td className="py-2 tabular-nums">{row.in2}</td>
                    <td className="py-2">
                      <Badge
                        tone={row.status === "both" ? "ok" : "warn"}
                      >
                        {row.status === "both" ? "both" : row.status === "only1" ? "A only" : "B only"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
