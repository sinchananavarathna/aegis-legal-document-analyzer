import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTRACT_META, generateContract } from "@/lib/legal/templates";
import type { ContractType } from "@/lib/legal/types";
import { cn } from "@/lib/utils";

const TYPES: ContractType[] = ["nda", "service", "freelance", "employment"];

export function GeneratePanel() {
  const [type, setType] = useState<ContractType>("nda");
  const meta = CONTRACT_META[type];
  const [fields, setFields] = useState<Record<string, string>>({});

  const draft = useMemo(() => generateContract(type, fields), [type, fields]);

  function download() {
    const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-agreement.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] uppercase tracking-[0.16em] text-subtle">Templates</p>
        <h2 className="mt-1 font-display text-3xl leading-none">Draft a contract</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setFields({});
              }}
              className={cn(
                "rounded-[var(--radius-md)] border px-3 py-3 text-left transition-colors",
                type === t
                  ? "border-accent bg-elevated text-fg"
                  : "border-border text-muted hover:text-fg",
              )}
            >
              <span className="block text-sm text-fg">{CONTRACT_META[t].title}</span>
              <span className="mt-1 block text-xs text-subtle">{CONTRACT_META[t].blurb}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {meta.fields.map((f) => (
            <label key={f.key} className="block">
              <span className="text-xs uppercase tracking-[0.12em] text-subtle">{f.label}</span>
              {f.multiline ? (
                <textarea
                  rows={3}
                  value={fields[f.key] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => setFields((s) => ({ ...s, [f.key]: e.target.value }))}
                  className="mt-1 w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 py-2 text-sm outline-none"
                />
              ) : (
                <input
                  value={fields[f.key] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => setFields((s) => ({ ...s, [f.key]: e.target.value }))}
                  className="mt-1 h-11 w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 text-sm outline-none"
                />
              )}
            </label>
          ))}
        </div>
        <Button className="mt-5 w-full" onClick={download}>
          <Download className="size-4" />
          Download text
        </Button>
      </div>

      <pre className="max-h-[44rem] overflow-auto whitespace-pre-wrap rounded-[var(--radius-xl)] border border-border bg-bg p-5 font-mono text-xs leading-relaxed text-fg/90 shadow-[var(--shadow-panel)]">
        {draft}
      </pre>
    </div>
  );
}
