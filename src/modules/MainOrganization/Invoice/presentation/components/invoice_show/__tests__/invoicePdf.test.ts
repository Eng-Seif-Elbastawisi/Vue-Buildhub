import { describe, expect, it, vi } from 'vitest';
import type { jsPDF } from 'jspdf';
import { addPdfPageBranding, addPdfProjectPhoto } from '../invoicePdf';

const createPdfBoundary = () => {
  return {
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
    },
    getNumberOfPages: vi.fn(() => 2),
    setPage: vi.fn(),
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    setDrawColor: vi.fn(),
    line: vi.fn(),
    text: vi.fn(),
    getImageProperties: vi.fn(() => ({ width: 200, height: 100 })),
    addImage: vi.fn(),
  };
};

describe('invoice PDF branding', () => {
  it('adds a proportionate company logo and contact footer to every page', () => {
    const pdfBoundary = createPdfBoundary();

    addPdfPageBranding(pdfBoundary as unknown as jsPDF, {
      title: 'Invoice',
      generatedAt: '20 Jul 2026',
      company: {
        name: 'Techlab',
        logo: 'data:image/png;base64,logo',
        contactLines: ['Email: billing@techlab.test | Phone: +20 100', 'Address: Cairo'],
      },
    });

    expect(pdfBoundary.setPage.mock.calls).toEqual([[1], [2]]);
    expect(pdfBoundary.addImage).toHaveBeenCalledTimes(2);
    expect(pdfBoundary.addImage).toHaveBeenCalledWith(
      'data:image/png;base64,logo',
      16,
      12.5,
      18,
      9,
    );
    expect(pdfBoundary.text.mock.calls.map(([text]) => text)).toContain('Techlab');
    expect(pdfBoundary.text.mock.calls.map(([text]) => text)).toContain(
      'Email: billing@techlab.test | Phone: +20 100',
    );
    expect(pdfBoundary.text.mock.calls.map(([text]) => text)).toContain('Address: Cairo');
  });

  it('adds the project photo without stretching its proportions', () => {
    const pdfBoundary = createPdfBoundary();

    addPdfProjectPhoto(
      pdfBoundary as unknown as jsPDF,
      'data:image/webp;base64,project',
      'Tower project',
    );

    expect(pdfBoundary.addImage).toHaveBeenCalledWith(
      'data:image/webp;base64,project',
      65,
      41,
      80,
      40,
    );
    expect(pdfBoundary.text).toHaveBeenCalledWith('Tower project', 105, 88, {
      align: 'center',
      maxWidth: 178,
    });
  });
});
