import type TitleInterface from '@/base/Data/Models/titleInterface';
import type TermModel from '@/modules/MainOrganization/Term/core/models/term.model';

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const normalizeInlineText = (value?: string): string => value?.replace(/\s+/g, ' ').trim() || '';

export const formatSelectedProjectTerms = (
  selectedTerms: TitleInterface<number>[],
  availableTerms: TermModel[],
): string => {
  const termsById = new Map<number, TermModel>();

  availableTerms.forEach((term) => {
    if (term.id !== undefined) termsById.set(Number(term.id), term);
  });

  return selectedTerms
    .map((selectedTerm) => {
      const fullTerm = termsById.get(Number(selectedTerm.id));
      const title = normalizeInlineText(fullTerm?.title || selectedTerm.title);
      const description = normalizeInlineText(fullTerm?.description);

      return [
        title ? `<p><strong>${escapeHtml(title)}</strong></p>` : '',
        description ? `<p>${escapeHtml(description)}</p>` : '',
      ]
        .filter(Boolean)
        .join('');
    })
    .filter(Boolean)
    .join('<p><br></p>');
};
