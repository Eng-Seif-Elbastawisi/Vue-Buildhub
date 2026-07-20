import type { jsPDF } from 'jspdf';
import { getContainedPdfImageDimensions, type PdfImageData } from './loadPdfImage';

export interface PdfCompanyBranding {
  name: string;
  logo?: PdfImageData | null;
  contactLines: string[];
}

export interface PdfPageBranding {
  title: string;
  company: PdfCompanyBranding;
  fontFamily?: string;
  formatText?: (text: string) => string;
}

export const PDF_PAGE_HORIZONTAL_MARGIN = 16;
export const PDF_TABLE_MARGIN = {
  top: 30,
  bottom: 26,
};

const LOGO_BOX_SIZE = 12;

const formatBrandingText = (branding: PdfPageBranding, text: string) => {
  return branding.formatText?.(text) ?? text;
};

const addCompanyLogo = (pdf: jsPDF, logo: PdfImageData) => {
  const dimensions = getContainedPdfImageDimensions(pdf, logo, LOGO_BOX_SIZE, LOGO_BOX_SIZE);
  const x = PDF_PAGE_HORIZONTAL_MARGIN + (LOGO_BOX_SIZE - dimensions.width) / 2;
  const y = 5 + (LOGO_BOX_SIZE - dimensions.height) / 2;

  pdf.addImage(logo, x, y, dimensions.width, dimensions.height);
};

const addPageHeader = (pdf: jsPDF, branding: PdfPageBranding) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const companyTextX = branding.company.logo ? 31 : PDF_PAGE_HORIZONTAL_MARGIN;
  const rightEdge = pageWidth - PDF_PAGE_HORIZONTAL_MARGIN;
  const fontFamily = branding.fontFamily ?? 'helvetica';

  if (branding.company.logo) addCompanyLogo(pdf, branding.company.logo);

  pdf.setFont(fontFamily, 'bold');
  pdf.setFontSize(11);
  pdf.text(formatBrandingText(branding, branding.company.name), companyTextX, 13, {
    maxWidth: 90,
  });
  pdf.setFontSize(10);
  pdf.text(formatBrandingText(branding, branding.title), rightEdge, 12, {
    align: 'right',
    maxWidth: 90,
  });

  pdf.setDrawColor(210);
  pdf.line(PDF_PAGE_HORIZONTAL_MARGIN, 24, rightEdge, 24);
};

const addPageFooter = (pdf: jsPDF, branding: PdfPageBranding) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const visibleLines = branding.company.contactLines.slice(0, 2);

  pdf.setDrawColor(210);
  pdf.line(
    PDF_PAGE_HORIZONTAL_MARGIN,
    pageHeight - 21,
    pageWidth - PDF_PAGE_HORIZONTAL_MARGIN,
    pageHeight - 21,
  );
  pdf.setFont(branding.fontFamily ?? 'helvetica', 'normal');
  pdf.setFontSize(8);
  visibleLines.forEach((line, index) => {
    pdf.text(formatBrandingText(branding, line), pageWidth / 2, pageHeight - 14 + index * 5, {
      align: 'center',
      maxWidth: pageWidth - PDF_PAGE_HORIZONTAL_MARGIN * 2,
    });
  });
};

export const addPdfPageBranding = (pdf: jsPDF, branding: PdfPageBranding) => {
  for (let pageNumber = 1; pageNumber <= pdf.getNumberOfPages(); pageNumber += 1) {
    pdf.setPage(pageNumber);
    addPageHeader(pdf, branding);
    addPageFooter(pdf, branding);
  }
};
