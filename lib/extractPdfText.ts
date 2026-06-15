/**
 * Reads only the PDF structure to return the total page count.
 * Does not extract any page text — much faster than a full extraction pass.
 * Use this to gate large PDFs before calling extractTextFromPdf.
 */
export async function getPdfPageCount(file: File): Promise<number> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, verbosity: 0 }).promise;
  return pdf.numPages;
}

export type PdfExtractionResult =
  | {
      ok: true;
      text: string;
      totalPageCount: number;
      extractedPageCount: number;
      wasTruncatedByPage: boolean;
    }
  | { ok: false; reason: "scanned" | "error"; message: string };

/**
 * Client-side PDF text extraction using pdfjs-dist.
 * Dynamically imported so it never runs on the server.
 * Worker is loaded from unpkg CDN to avoid Turbopack/webpack worker bundling.
 *
 * Extracts up to maxPages pages. If the PDF is longer, wasTruncatedByPage is true
 * and only the first maxPages pages are returned.
 */
export async function extractTextFromPdf(file: File, maxPages = 10): Promise<PdfExtractionResult> {
  try {
    const pdfjsLib = await import("pdfjs-dist");

    // CDN worker avoids any bundler config — reliable for a client-only prototype.
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      verbosity: 0, // suppress internal console output
    }).promise;

    const totalPageCount = pdf.numPages;
    const pagesToExtract = Math.min(totalPageCount, maxPages);
    const wasTruncatedByPage = totalPageCount > maxPages;

    console.log(
      `[PDF] Total pages: ${totalPageCount} | Extracting: ${pagesToExtract}${
        wasTruncatedByPage ? ` (capped from ${totalPageCount} — limit is ${maxPages})` : ""
      }`
    );

    const pageParts: string[] = [];

    for (let p = 1; p <= pagesToExtract; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      const pageText = content.items
        .filter((item) => "str" in item)
        .map((item) => (item as { str: string }).str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (pageText) pageParts.push(pageText);
    }

    const fullText = pageParts.join("\n\n").trim();

    console.log(
      `[PDF] Extracted ${pagesToExtract} page(s) → ${fullText.length.toLocaleString()} chars / ~${fullText.trim().split(/\s+/).length.toLocaleString()} words`
    );

    // Heuristic: fewer than 100 characters across the whole extracted portion almost
    // certainly means the pages are scanned images with no embedded text layer.
    if (fullText.length < 100) {
      return {
        ok: false,
        reason: "scanned",
        message: "Scanned PDFs are not supported in this prototype.",
      };
    }

    return {
      ok: true,
      text: fullText,
      totalPageCount,
      extractedPageCount: pagesToExtract,
      wasTruncatedByPage,
    };
  } catch {
    return {
      ok: false,
      reason: "error",
      message:
        "Could not extract text from this PDF. The file may be corrupted or password-protected.",
    };
  }
}
