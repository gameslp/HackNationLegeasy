import { PDFParse } from 'pdf-parse';
import fs from 'fs/promises';

export interface PdfExtractResult {
  text: string;
}

/**
 * Extracts text content from a PDF file
 */
export async function extractTextFromPdf(pdfPath: string): Promise<PdfExtractResult> {
  let parser: InstanceType<typeof PDFParse> | null = null;

  try {
    // Read the file as buffer
    const buffer = await fs.readFile(pdfPath);

    // Create parser with buffer data
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();

    return {
      text: result.text,
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
}
