import type { jsPDF } from 'jspdf';
import pdfArabicBoldFontUrl from '@/assets/fonts/Noto/NotoNaskhArabic-Bold.ttf?url';
import pdfArabicRegularFontUrl from '@/assets/fonts/Noto/NotoNaskhArabic-Regular.ttf?url';

export const PDF_ARABIC_FONT_FAMILY = 'NotoNaskhArabic';

let pdfArabicFontFiles: { regular: string; bold: string } | null = null;

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return window.btoa(binary);
};

const fetchPdfFont = async (fontUrl: string) => {
  const response = await fetch(fontUrl);

  return arrayBufferToBase64(await response.arrayBuffer());
};

const loadPdfArabicFonts = async () => {
  if (pdfArabicFontFiles) return pdfArabicFontFiles;

  const [regular, bold] = await Promise.all([
    fetchPdfFont(pdfArabicRegularFontUrl),
    fetchPdfFont(pdfArabicBoldFontUrl),
  ]);

  pdfArabicFontFiles = { regular, bold };

  return pdfArabicFontFiles;
};

export const isArabicPdfLocale = (locale: string) => locale.startsWith('ar');

export const getPdfFontFamily = (locale: string) =>
  isArabicPdfLocale(locale) ? PDF_ARABIC_FONT_FAMILY : 'helvetica';

export const configurePdfDocumentFont = async (pdf: jsPDF, locale: string) => {
  if (isArabicPdfLocale(locale)) {
    const fonts = await loadPdfArabicFonts();

    pdf.addFileToVFS('NotoNaskhArabic-Regular.ttf', fonts.regular);
    pdf.addFont('NotoNaskhArabic-Regular.ttf', PDF_ARABIC_FONT_FAMILY, 'normal');
    pdf.addFileToVFS('NotoNaskhArabic-Bold.ttf', fonts.bold);
    pdf.addFont('NotoNaskhArabic-Bold.ttf', PDF_ARABIC_FONT_FAMILY, 'bold');
  }

  pdf.setR2L(false);
};

export const shapeArabicPdfText = (pdf: jsPDF, text: string) => pdf.processArabic(text);
