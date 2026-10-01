import type {
  AnalysisResult,
  ClauseMatch,
  ContractType,
  Factor,
  SigningRecommendation,
} from "./types";

const CLAUSE_PATTERNS: Record<string, RegExp> = {
  confidentiality: /confidential(?:ity| information| agreement)/gi,
  indemnification: /indemnif(?:y|ication|ies|ing)/gi,
  liability: /liability|limitation of liability|disclaimer of liability/gi,
  termination: /terminat(?:ion|e|es|ing)/gi,
  governing_law: /governing law|choice of law|jurisdiction|venue/gi,
  amendment: /amend(?:ment|ing|ed)/gi,
  dispute_resolution: /dispute resolution|arbitration|mediation/gi,
  force_majeure: /force majeure/gi,
  assignment: /assign(?:ment|ability|s)/gi,
  warranty: /warrant(?:y|ies|s)/gi,
  severability: /severability/gi,
  non_compete: /non[- ]compet(?:e|ition)/gi,
  intellectual_property: /intellectual property|work for hire|work made for hire/gi,
  payment: /payment terms|invoic(?:e|ing)|compensation/gi,
};

const RISK_PATTERNS: {
  type: string;
  pattern: RegExp;
  weight: number;
  description: string;
}[] = [
  {
    type: "unlimited_liability",
    pattern: /unlimited liability|all liability|full liability|no limitation of liability/gi,
    weight: -20,
    description: "Unlimited or uncapped liability",
  },
  {
    type: "unilateral_changes",
    pattern:
      /(?:may|can|will) (?:modify|change|alter|amend) (?:at any time|without notice|in its sole discretion|unilaterally)/gi,
    weight: -15,
    description: "Unilateral modification rights",
  },
  {
    type: "broad_indemnification",
    pattern: /indemnif(?:y|ication) (?:against|from) any and all (?:claims|losses|damages)/gi,
    weight: -12,
    description: "Broad indemnification of any and all claims",
  },
  {
    type: "automatic_renewal",
    pattern: /automatically renew(?:s|ed|al)/gi,
    weight: -8,
    description: "Automatic renewal",
  },
  {
    type: "waiver_of_rights",
    pattern: /waive(?:s|r of) (?:right|jury trial|class action)/gi,
    weight: -15,
    description: "Waiver of significant legal rights",
  },
  {
    type: "perpetual_obligations",
    pattern: /(?:perpetual|indefinite|survive termination)/gi,
    weight: -8,
    description: "Perpetual or surviving obligations",
  },
  {
    type: "as_is",
    pattern: /\bas is\b|without recourse|non-negotiable/gi,
    weight: -8,
    description: "As-is / non-negotiable terms",
  },
];

const FAVORABLE_PATTERNS: {
  type: string;
  pattern: RegExp;
  weight: number;
  description: string;
}[] = [
  {
    type: "mutual_termination",
    pattern: /(?:either|both|any) part(?:y|ies) may terminate/gi,
    weight: 12,
    description: "Mutual termination rights",
  },
  {
    type: "limited_liability",
    pattern:
      /liability (?:limited to|shall not exceed)|limitation of liability/gi,
    weight: 12,
    description: "Liability is limited",
  },
  {
    type: "notice_period",
    pattern: /(?:\d+|ninety|thirty|sixty)[-\s]?(?:business )?days['’]? (?:prior )?written notice/gi,
    weight: 8,
    description: "Defined notice period",
  },
  {
    type: "dispute_resolution",
    pattern: /(?:binding )?arbitration|(?:mandatory )?mediation|dispute resolution/gi,
    weight: 10,
    description: "Defined dispute resolution",
  },
  {
    type: "mutual_confidentiality",
    pattern: /mutual (?:non-disclosure|confidentiality)|each (?:party|receiving party)/gi,
    weight: 7,
    description: "Mutual confidentiality",
  },
  {
    type: "governing_law_defined",
    pattern:
      /governed by (?:and construed in accordance with )?the laws of/gi,
    weight: 8,
    description: "Governing law is defined",
  },
  {
    type: "right_to_cure",
    pattern: /(?:right|opportunity) to cure/gi,
    weight: 7,
    description: "Right to cure a breach",
  },
];

const CRITICAL_CLAUSES = [
  "indemnification",
  "governing_law",
  "termination",
  "dispute_resolution",
] as const;

const TYPE_CRITICAL_CLAUSES: Record<ContractType, string[]> = {
  nda: ["confidentiality", "termination", "governing_law", "intellectual_property"],
  service: ["payment", "liability", "indemnification", "termination", "governing_law"],
  freelance: ["payment", "intellectual_property", "termination", "liability"],
  employment: ["termination", "governing_law", "intellectual_property", "payment"],
};

const TYPE_DETECTION_PATTERNS: { type: ContractType; patterns: RegExp[] }[] = [
  {
    type: "nda",
    patterns: [
      /non-disclosure|confidential(?:ity) agreement|NDA/gi,
      /disclosing party|receiving party/gi,
      /confidential information.*(?:permitted )?purpose/gi,
    ],
  },
  {
    type: "employment",
    patterns: [
      /employment (?:offer|letter|agreement)|at-will/gi,
      /employee.*(?:salary|compensation|title)/gi,
      /you will (?:perform|devote)/gi,
    ],
  },
  {
    type: "service",
    patterns: [
      /professional services (?:agreement|contract)/gi,
      /provider.*client.*(?:scope|services)/gi,
      /independent contractor.*(?:not an employee)/gi,
    ],
  },
  {
    type: "freelance",
    patterns: [
      /independent contractor (?:agreement|contract)/gi,
      /contractor.*client.*(?:deliverables|services)/gi,
      /work (?:made for )?hire|work product/gi,
    ],
  },
];

export function detectContractType(text: string): ContractType | null {
  const scores: Record<string, number> = { nda: 0, service: 0, freelance: 0, employment: 0 };
  for (const { type, patterns } of TYPE_DETECTION_PATTERNS) {
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) scores[type] += matches.length;
    }
  }
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (entries[0][1] === 0) return null;
  return entries[0][0] as ContractType;
}

function excerptAround(text: string, start: number, end: number, pad = 72) {
  const s = Math.max(0, start - pad);
  const e = Math.min(text.length, end + pad);
  return (s > 0 ? "…" : "") + text.slice(s, e).replace(/\s+/g, " ") + (e < text.length ? "…" : "");
}

function findMatches(text: string, pattern: RegExp): ClauseMatch[] {
  const matches: ClauseMatch[] = [];
  const re = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    matches.push({
      text: m[0],
      start: m.index,
      end: m.index + m[0].length,
      lineNumber: text.slice(0, m.index).split("\n").length,
      excerpt: excerptAround(text, m.index, m.index + m[0].length),
    });
    if (m[0].length === 0) re.lastIndex++;
  }
  return matches;
}

function unique(list: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    const key = item.trim().replace(/\s+/g, " ");
    if (!key || key.length < 2) continue;
    const k = key.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(key);
  }
  return out;
}

export function extractEntities(text: string): Record<string, string[]> {
  const orgs =
    text.match(
      /\b[A-Z][A-Za-z0-9&.\-']+(?:\s+[A-Z][A-Za-z0-9&.\-']+){0,5}\s+(?:Ltd\.?|LLC|Inc\.?|Corp\.?|Corporation|Limited|GmbH|LLP|PLC)\b/g,
    ) ?? [];
  const money =
    text.match(
      /(?:USD|EUR|GBP|\$|€|£)\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\b\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s?(?:USD|dollars|euros|pounds)\b/gi,
    ) ?? [];
  const dates =
    text.match(
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b|\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/g,
    ) ?? [];
  const durations =
    text.match(
      /\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|thirty|sixty|ninety)\s+(?:business\s+)?(?:day|days|week|weeks|month|months|year|years)\b/gi,
    ) ?? [];
  const parties =
    text.match(
      /\b(?:Disclosing Party|Receiving Party|Client|Contractor|Vendor|Licensor|Licensee|Employer|Employee|Company|Consultant|the Parties)\b/g,
    ) ?? [];
  const law =
    text.match(
      /laws of (?:the )?(?:State of )?[A-Z][A-Za-z ]+(?:, [A-Z]{2})?|England and Wales|Delaware|California|New York|Singapore|United Kingdom/g,
    ) ?? [];
  const locations =
    text.match(
      /\b(?:London|Wilmington|New York|Delaware|California|United Kingdom|United States|Singapore|Canary Wharf)\b/g,
    ) ?? [];

  const entities: Record<string, string[]> = {};
  const map: Record<string, string[]> = {
    ORGANIZATIONS: orgs,
    MONEY_AMOUNTS: money,
    CONTRACT_DATES: dates,
    DURATIONS: durations,
    CONTRACT_PARTIES: parties,
    GOVERNING_LAW: law,
    LOCATIONS: locations,
  };
  for (const [k, v] of Object.entries(map)) {
    const u = unique(v);
    if (u.length) entities[k] = u.slice(0, 24);
  }
  return entities;
}

function extractiveSummary(text: string, n = 4): string {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40 && s.length < 420);
  if (!sentences.length) {
    return text.slice(0, 420).trim() + (text.length > 420 ? "…" : "");
  }
  const scored = sentences.map((s, i) => {
    let score = Math.min(s.length, 280) / 280;
    if (i < 3) score += 0.45;
    if (/whereas|agree|party|confidential|liability|term/i.test(s)) score += 0.3;
    return { s, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored
    .slice(0, n)
    .map((x) => x.s)
    .join(" ");
}

function recommendationLabel(score: number): { label: string; recommendation: string } {
  if (score >= 80)
    return {
      label: "Favorable",
      recommendation: "Structure looks sound. Proceed with a normal legal review before signing.",
    };
  if (score >= 65)
    return {
      label: "Cautious",
      recommendation: "Mostly balanced. Review highlighted risks and missing clauses before signing.",
    };
  if (score >= 50)
    return {
      label: "Needs review",
      recommendation: "Several gaps or one-sided terms. Negotiate or obtain counsel before signing.",
    };
  if (score >= 35)
    return {
      label: "Unfavorable",
      recommendation: "Material risks identified. Do not sign without negotiated changes.",
    };
  return {
    label: "High risk",
    recommendation: "Significant one-sided terms. Recommend rejection or a full rewrite.",
  };
}

export function scoreDocument(
  text: string,
  clauses: Record<string, ClauseMatch[]>,
  entities: Record<string, string[]>,
  contractType?: ContractType | null,
): SigningRecommendation {
  let score = 60;
  const favorable: Factor[] = [];
  const risks: Factor[] = [];
  let patternImpact = 0;

  for (const risk of RISK_PATTERNS) {
    const hits = findMatches(text, risk.pattern);
    if (!hits.length) continue;
    const impact = risk.weight * Math.min(hits.length, 3);
    patternImpact += impact;
    risks.push({
      type: risk.type,
      description: risk.description,
      weight: impact,
      matches: hits.length,
      examples: hits.slice(0, 2).map((h) => h.excerpt),
    });
  }

  for (const fav of FAVORABLE_PATTERNS) {
    const hits = findMatches(text, fav.pattern);
    if (!hits.length) continue;
    const impact = fav.weight * Math.min(hits.length, 2);
    patternImpact += impact;
    favorable.push({
      type: fav.type,
      description: fav.description,
      weight: impact,
      matches: hits.length,
      examples: hits.slice(0, 2).map((h) => h.excerpt),
    });
  }

  const words = text.split(/\s+/).filter(Boolean);
  const lengthDampener = Math.min(1, 800 / Math.max(words.length, 100));
  score += Math.round(patternImpact * lengthDampener);

  const criticalClauses = contractType
    ? (TYPE_CRITICAL_CLAUSES[contractType] ?? CRITICAL_CLAUSES)
    : [...CRITICAL_CLAUSES];

  const missingClauses: string[] = [];
  for (const name of criticalClauses) {
    if (!clauses[name]?.length) {
      missingClauses.push(name.replaceAll("_", " "));
      score -= 10;
      risks.push({
        type: `missing_${name}`,
        description: `Missing clause: ${name.replaceAll("_", " ")}`,
        weight: -10,
      });
    } else {
      score += 3;
      favorable.push({
        type: `present_${name}`,
        description: `Includes ${name.replaceAll("_", " ")} language`,
        weight: 3,
      });
    }
  }

  if (words.length < 200) {
    score -= 10;
    risks.push({
      type: "short_document",
      description: "Document is very short and may be incomplete",
      weight: -10,
    });
  }

  if (entities.CONTRACT_PARTIES?.length) {
    score += 5;
    favorable.push({
      type: "clear_parties",
      description: "Parties are identified",
      weight: 5,
    });
  } else {
    score -= 8;
    risks.push({
      type: "unclear_parties",
      description: "Parties are ambiguous or missing",
      weight: -8,
    });
  }

  if (entities.GOVERNING_LAW?.length) {
    score += 4;
    favorable.push({
      type: "defined_governing_law",
      description: "Governing law location found",
      weight: 4,
    });
  }

  const percentage = Math.max(0, Math.min(100, Math.round(score)));
  const { label, recommendation } = recommendationLabel(percentage);
  return {
    percentage,
    label,
    recommendation,
    findings: { favorable, risks },
    missingClauses,
  };
}

export function analyzeText(text: string, fileName = "document.txt"): AnalysisResult {
  const cleaned = text.replace(/\0/g, "").trim();
  const clauses: Record<string, ClauseMatch[]> = {};
  for (const [name, pattern] of Object.entries(CLAUSE_PATTERNS)) {
    const hits = findMatches(cleaned, pattern);
    if (hits.length) clauses[name] = hits.slice(0, 40);
  }
  const entities = extractEntities(cleaned);
  const words = cleaned.split(/\s+/).filter(Boolean);
  const paragraphs = cleaned.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const sentences = cleaned.split(/[.!?]+/).filter((s) => s.trim().length > 12);
  const detectedType = detectContractType(cleaned);

  return {
    fileName,
    clauses,
    entities,
    summary: extractiveSummary(cleaned),
    statistics: {
      wordCount: words.length,
      charCount: cleaned.length,
      paragraphCount: paragraphs.length,
      sentenceCount: sentences.length,
    },
    cleanedText: cleaned,
    signing: scoreDocument(cleaned, clauses, entities, detectedType),
    detectedType,
  };
}

export function compareAnalyses(a: AnalysisResult, b: AnalysisResult) {
  const names = new Set([...Object.keys(a.clauses), ...Object.keys(b.clauses)]);
  const clauseDiff = [...names].sort().map((name) => {
    const in1 = a.clauses[name]?.length ?? 0;
    const in2 = b.clauses[name]?.length ?? 0;
    return {
      name,
      in1,
      in2,
      status: (in1 && in2 ? "both" : in1 ? "only1" : "only2") as "both" | "only1" | "only2",
    };
  });

  const setA = new Set(a.cleanedText.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
  const setB = new Set(b.cleanedText.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
  let inter = 0;
  for (const w of setA) if (setB.has(w)) inter++;
  const similarity = Math.round((2 * inter) / Math.max(1, setA.size + setB.size) * 100);

  const critical: { title: string; detail: string; severity: "high" | "medium" | "low" }[] = [];
  const scoreDelta = a.signing.percentage - b.signing.percentage;
  if (Math.abs(scoreDelta) >= 8) {
    critical.push({
      title: "Signing score diverges",
      detail: `${a.fileName} scores ${a.signing.percentage} vs ${b.fileName} at ${b.signing.percentage}.`,
      severity: Math.abs(scoreDelta) >= 20 ? "high" : "medium",
    });
  }
  for (const row of clauseDiff) {
    if (row.status !== "both") {
      critical.push({
        title: `${row.name.replaceAll("_", " ")} mismatch`,
        detail:
          row.status === "only1"
            ? `Present in ${a.fileName} only (${row.in1} hits).`
            : `Present in ${b.fileName} only (${row.in2} hits).`,
        severity: CRITICAL_CLAUSES.includes(row.name as (typeof CRITICAL_CLAUSES)[number])
          ? "high"
          : "medium",
      });
    }
  }

  return { similarity, clauseDiff, critical: critical.slice(0, 12) };
}
