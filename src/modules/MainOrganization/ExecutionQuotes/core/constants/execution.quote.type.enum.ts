import TitleInterface from '@/base/Data/Models/titleInterface';
import { translate } from '@/locales/i18n';

export const ExecutionQuoteTypeEnum = {
  LUMP_SUM: 1,
  SUPERVISION: 2,
} as const;

export type ExecutionQuoteType =
  (typeof ExecutionQuoteTypeEnum)[keyof typeof ExecutionQuoteTypeEnum];

const getExecutionQuoteTypeLocaleName = (type: ExecutionQuoteType): string | null => {
  switch (type) {
    case ExecutionQuoteTypeEnum.LUMP_SUM:
      return 'lump_sum';
    case ExecutionQuoteTypeEnum.SUPERVISION:
      return 'supervision';
    default:
      return null;
  }
};

const getExecutionQuoteTypeTranslationKey = (
  type: ExecutionQuoteType,
  field: 'title' | 'description',
): string => {
  const localeName = getExecutionQuoteTypeLocaleName(type);
  return localeName ? `execution_quote.quote_types.${localeName}.${field}` : 'unknown';
};

export const getExecutionQuoteTypeTitleKey = (type: ExecutionQuoteType): string =>
  getExecutionQuoteTypeTranslationKey(type, 'title');

export const getExecutionQuoteTypeDescriptionKey = (type: ExecutionQuoteType): string =>
  getExecutionQuoteTypeTranslationKey(type, 'description');

export const getExecutionQuoteTypeOptions = (): TitleInterface<ExecutionQuoteType>[] =>
  Object.values(ExecutionQuoteTypeEnum).map(
    (type, index) =>
      new TitleInterface<ExecutionQuoteType>({
        id: index + 1,
        title: translate(getExecutionQuoteTypeTitleKey(type)),
        subtitle: type,
      }),
  );
