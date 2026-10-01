export type ClauseMatch = {
  text: string;
  start: number;
  end: number;
  lineNumber: number;
  excerpt: string;
};

export type Factor = {
  type: string;
  description: string;
  weight: number;
  matches?: number;
  examples?: string[];
};

export type SigningRecommendation = {
  percentage: number;
  label: string;
  recommendation: string;
  findings: {
    favorable: Factor[];
    risks: Factor[];
  };
  missingClauses: string[];
};

export type AnalysisResult = {
  fileName: string;
  clauses: Record<string, ClauseMatch[]>;
  entities: Record<string, string[]>;
  summary: string;
  statistics: {
    wordCount: number;
    charCount: number;
    paragraphCount: number;
    sentenceCount: number;
  };
  cleanedText: string;
  signing: SigningRecommendation;
  detectedType: ContractType | null;
};

export type ComparisonResult = {
  doc1: AnalysisResult;
  doc2: AnalysisResult;
  similarity: number;
  clauseDiff: {
    name: string;
    in1: number;
    in2: number;
    status: "both" | "only1" | "only2";
  }[];
  critical: { title: string; detail: string; severity: "high" | "medium" | "low" }[];
};

export type ContractType =
  | "nda"
  | "service"
  | "freelance"
  | "employment";

export type ContractField = {
  key: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
};
