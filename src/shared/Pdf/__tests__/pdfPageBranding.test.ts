import { describe, expect, it, vi } from 'vitest';
import type { jsPDF } from 'jspdf';
import { addPdfPageBranding } from '../pdfPageBranding';

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

describe('PDF page branding', () => {
  it('renders a compact company identity and document title header', () => {
    const pdfBoundary = createPdfBoundary();

    addPdfPageBranding(pdfBoundary as unknown as jsPDF, {
      title: 'Invoice',
      company: {
        name: 'Techlab',
        logo: 'data:image/png;base64,logo',
        contactLines: ['Email: billing@techlab.test | Phone: +20 100', 'Address: Cairo'],
      },
    });

    expect(pdfBoundary.setPage.mock.calls).toEqual([[1], [2]]);
    expect(pdfBoundary.addImage).toHaveBeenCalledTimes(2);
    expect(pdfBoundary.addImage).toHaveBeenCalledWith('data:image/png;base64,logo', 16, 8, 12, 6);
    expect(pdfBoundary.text).toHaveBeenCalledWith('Techlab', 31, 13, { maxWidth: 90 });
    expect(pdfBoundary.text).toHaveBeenCalledWith('Invoice', 194, 12, {
      align: 'right',
      maxWidth: 90,
    });
    expect(pdfBoundary.text.mock.calls.filter(([, x, y]) => x === 194 && y === 19)).toEqual([]);
    expect(pdfBoundary.text.mock.calls.map(([text]) => text)).toContain(
      'Email: billing@techlab.test | Phone: +20 100',
    );
    expect(pdfBoundary.text.mock.calls.map(([text]) => text)).toContain('Address: Cairo');
  });
});
