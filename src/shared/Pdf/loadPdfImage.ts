import type { jsPDF } from 'jspdf';

export type PdfImageData = string | Uint8Array;

export const getContainedPdfImageDimensions = (
  pdf: jsPDF,
  image: PdfImageData,
  maxWidth: number,
  maxHeight: number,
) => {
  const properties = pdf.getImageProperties(image);
  const ratio = properties.width / properties.height;
  const boxRatio = maxWidth / maxHeight;

  return ratio >= boxRatio
    ? { width: maxWidth, height: maxWidth / ratio }
    : { width: maxHeight * ratio, height: maxHeight };
};

export const loadPdfImage = async (source?: string | null): Promise<PdfImageData | null> => {
  if (!source) return null;
  if (source.startsWith('data:')) return source;

  try {
    const response = await fetch(source);

    if (!response.ok) return null;

    return new Uint8Array(await response.arrayBuffer());
  } catch (error) {
    if (error instanceof TypeError) return null;

    throw error;
  }
};

export const loadFirstPdfImage = async (sources: Array<string | null | undefined>) => {
  for (const source of sources) {
    const image = await loadPdfImage(source);

    if (image) return image;
  }

  return null;
};
