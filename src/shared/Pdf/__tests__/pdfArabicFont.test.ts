import { describe, expect, it, vi } from 'vitest';
import type { jsPDF } from 'jspdf';
import { configurePdfDocumentFont, getPdfFontFamily, shapeArabicPdfText } from '../pdfArabicFont';

const createPdfBoundary = () => ({
  addFileToVFS: vi.fn(),
  addFont: vi.fn(),
  setR2L: vi.fn(),
  processArabic: vi.fn((text: string) => `arabic:${text}`),
});

describe('PDF Arabic font support', () => {
  it('configures the embedded font and shapes Arabic text for an Arabic locale', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
      })),
    );
    const pdfBoundary = createPdfBoundary();

    await configurePdfDocumentFont(pdfBoundary as unknown as jsPDF, 'ar-EG');

    expect(getPdfFontFamily('ar-EG')).toBe('NotoNaskhArabic');
    expect(pdfBoundary.addFont.mock.calls).toEqual([
      ['NotoNaskhArabic-Regular.ttf', 'NotoNaskhArabic', 'normal'],
      ['NotoNaskhArabic-Bold.ttf', 'NotoNaskhArabic', 'bold'],
    ]);
    expect(pdfBoundary.setR2L).toHaveBeenCalledWith(false);
    expect(shapeArabicPdfText(pdfBoundary as unknown as jsPDF, 'ملخص الفاتورة')).toBe(
      'arabic:ملخص الفاتورة',
    );
  });
});
