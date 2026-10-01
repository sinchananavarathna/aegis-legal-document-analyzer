declare module "pdfjs-dist" {
  export const GlobalWorkerOptions: { workerSrc: string };
  export function getDocument(options: { data: ArrayBuffer }): {
    promise: Promise<{
      numPages: number;
      getPage(pageNumber: number): Promise<{
        getTextContent(): Promise<{ items: Array<{ str?: string }> }>;
      }>;
    }>;
  };
}
