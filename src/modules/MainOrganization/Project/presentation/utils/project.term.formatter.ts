import type TitleInterface from '@/base/Data/Models/titleInterface';
import type TermModel from '@/modules/MainOrganization/Term/core/models/term.model';

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
      const title = fullTerm?.title || selectedTerm.title || '';
      const description = fullTerm?.description?.trim() || '';

      return [title.trim(), description].filter(Boolean).join('\n');
    })
    .filter(Boolean)
    .join('\n\n');
};
