async function extractPdfText(buf: ArrayBuffer): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url,
  ).toString();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items
      .map((item) => item.str ?? "")
      .filter(Boolean);
    pages.push(strings.join(" "));
  }
  const text = pages.join("\n\n");
  if (!text.trim()) throw new Error("That PDF had no readable text.");
  return text;
}

export async function extractFileText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) {
    return file.text();
  }
  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    if (!result.value.trim()) throw new Error("That Word file had no readable text.");
    return result.value;
  }
  if (name.endsWith(".pdf")) {
    const buf = await file.arrayBuffer();
    return extractPdfText(buf);
  }
  throw new Error("Use a PDF, DOCX, or TXT file, or paste the contract text.");
}
