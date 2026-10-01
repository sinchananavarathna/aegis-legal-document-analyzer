import { openDB, type IDBPDatabase } from "idb";
import type { AnalysisResult, ComparisonResult } from "./legal/types";

const DB_NAME = "aegis-db";
const DB_VERSION = 1;

interface AnalysisRecord {
  id: string;
  fileName: string;
  savedAt: number;
  result: AnalysisResult;
}

interface ComparisonRecord {
  id: string;
  fileA: string;
  fileB: string;
  savedAt: number;
  result: ComparisonResult;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("analyses")) {
          const store = db.createObjectStore("analyses", { keyPath: "id" });
          store.createIndex("savedAt", "savedAt");
        }
        if (!db.objectStoreNames.contains("comparisons")) {
          const store = db.createObjectStore("comparisons", { keyPath: "id" });
          store.createIndex("savedAt", "savedAt");
        }
      },
    });
  }
  return dbPromise;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(36);
}

export async function saveAnalysis(result: AnalysisResult): Promise<string> {
  const id = hashString(result.fileName + result.cleanedText.slice(0, 200));
  const db = await getDb();
  const record: AnalysisRecord = {
    id,
    fileName: result.fileName,
    savedAt: Date.now(),
    result,
  };
  await db.put("analyses", record);
  return id;
}

export async function loadAnalysis(id: string): Promise<AnalysisResult | null> {
  const db = await getDb();
  const record = await db.get("analyses", id);
  return record?.result ?? null;
}

export async function listAnalyses(): Promise<
  { id: string; fileName: string; savedAt: number; score: number }[]
> {
  const db = await getDb();
  const all = await db.getAll("analyses");
  return all
    .map((r) => ({
      id: r.id,
      fileName: r.fileName,
      savedAt: r.savedAt,
      score: r.result.signing.percentage,
    }))
    .sort((a, b) => b.savedAt - a.savedAt);
}

export async function deleteAnalysis(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("analyses", id);
}

export async function saveComparison(
  fileA: string,
  fileB: string,
  result: ComparisonResult,
): Promise<string> {
  const id = hashString(fileA + fileB + Date.now());
  const db = await getDb();
  const record: ComparisonRecord = {
    id,
    fileA,
    fileB,
    savedAt: Date.now(),
    result,
  };
  await db.put("comparisons", record);
  return id;
}

export async function listComparisons(): Promise<
  { id: string; fileA: string; fileB: string; savedAt: number }[]
> {
  const db = await getDb();
  const all = await db.getAll("comparisons");
  return all
    .map((r) => ({
      id: r.id,
      fileA: r.fileA,
      fileB: r.fileB,
      savedAt: r.savedAt,
    }))
    .sort((a, b) => b.savedAt - a.savedAt);
}

export async function deleteComparison(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("comparisons", id);
}
