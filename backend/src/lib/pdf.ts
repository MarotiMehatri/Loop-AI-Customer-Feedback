interface PDFInput {
  title: string;
  dateRange?: string;
  data: unknown;
  type?: string;
}

export function generatePDFReport(input: PDFInput): Buffer {
  const { title, data } = input;
  const html = `<!DOCTYPE html><html><head><title>${title}</title></head><body><h1>${title}</h1><pre>${JSON.stringify(data, null, 2)}</pre></body></html>`;
  return Buffer.from(html, "utf-8");
}
