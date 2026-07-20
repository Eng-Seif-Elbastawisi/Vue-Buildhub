import type { jsPDF } from 'jspdf';
import { getContainedPdfImageDimensions, type PdfImageData } from '@/shared/Pdf/loadPdfImage';

export interface PdfCompanyBranding {
  name: string;
  logo?: PdfImageData | null;
  contactLines: string[];
}

export interface PdfPageBranding {
  title: string;
  generatedAt: string;
  company: PdfCompanyBranding;
}

const PAGE_HORIZONTAL_MARGIN = 16;
const LOGO_BOX_SIZE = 18;

const addCompanyLogo = (pdf: jsPDF, logo: PdfImageData) => {
  const dimensions = getContainedPdfImageDimensions(pdf, logo, LOGO_BOX_SIZE, LOGO_BOX_SIZE);
  const x = PAGE_HORIZONTAL_MARGIN + (LOGO_BOX_SIZE - dimensions.width) / 2;
  const y = 8 + (LOGO_BOX_SIZE - dimensions.height) / 2;

  pdf.addImage(logo, x, y, dimensions.width, dimensions.height);
};

export const addPdfProjectPhoto = (pdf: jsPDF, photo: PdfImageData, projectName: string) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const maxWidth = 80;
  const maxHeight = 42;
  const dimensions = getContainedPdfImageDimensions(pdf, photo, maxWidth, maxHeight);
  const x = (pageWidth - dimensions.width) / 2;
  const y = 40 + (maxHeight - dimensions.height) / 2;

  pdf.addImage(photo, x, y, dimensions.width, dimensions.height);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text(projectName, pageWidth / 2, 88, { align: 'center', maxWidth: 178 });
};

const addPageHeader = (pdf: jsPDF, branding: PdfPageBranding) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const textX = branding.company.logo ? 40 : PAGE_HORIZONTAL_MARGIN;

  if (branding.company.logo) addCompanyLogo(pdf, branding.company.logo);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.text(branding.company.name, textX, 15);
  pdf.setFontSize(10);
  pdf.text(branding.title, textX, 22);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(branding.generatedAt, textX, 27);
  pdf.setDrawColor(210);
  pdf.line(PAGE_HORIZONTAL_MARGIN, 34, pageWidth - PAGE_HORIZONTAL_MARGIN, 34);
};

const addPageFooter = (pdf: jsPDF, contactLines: string[]) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const visibleLines = contactLines.slice(0, 2);

  pdf.setDrawColor(210);
  pdf.line(
    PAGE_HORIZONTAL_MARGIN,
    pageHeight - 21,
    pageWidth - PAGE_HORIZONTAL_MARGIN,
    pageHeight - 21,
  );
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  visibleLines.forEach((line, index) => {
    pdf.text(line, pageWidth / 2, pageHeight - 14 + index * 5, {
      align: 'center',
      maxWidth: pageWidth - PAGE_HORIZONTAL_MARGIN * 2,
    });
  });
};

export const addPdfPageBranding = (pdf: jsPDF, branding: PdfPageBranding) => {
  for (let pageNumber = 1; pageNumber <= pdf.getNumberOfPages(); pageNumber += 1) {
    pdf.setPage(pageNumber);
    addPageHeader(pdf, branding);
    addPageFooter(pdf, branding.company.contactLines);
  }
};

export const PDF_TABLE_MARGIN = {
  top: 40,
  bottom: 26,
};

export const PDF_PROJECT_TABLE_START_Y = 94;
