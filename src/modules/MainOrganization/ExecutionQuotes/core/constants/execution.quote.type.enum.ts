import TitleInterface from '@/base/Data/Models/titleInterface';
import { translate } from '@/locales/i18n';

export const ExecutionQuoteTypeEnum = {
  LUMP_SUM: 'lump_sum',
  SUPERVISION: 'supervision',
} as const;

export type ExecutionQuoteType =
  (typeof ExecutionQuoteTypeEnum)[keyof typeof ExecutionQuoteTypeEnum];

export const getExecutionQuoteTypeTitleKey = (type: ExecutionQuoteType): string => {
  switch (type) {
    case ExecutionQuoteTypeEnum.LUMP_SUM:
      return 'execution_quote.quote_types.lump_sum.title';
    case ExecutionQuoteTypeEnum.SUPERVISION:
      return 'execution_quote.quote_types.supervision.title';
    default:
      return 'unknown';
  }
};

export const getExecutionQuoteTypeOptions = (): TitleInterface<ExecutionQuoteType>[] =>
  Object.values(ExecutionQuoteTypeEnum).map(
    (type, index) =>
      new TitleInterface<ExecutionQuoteType>({
        id: index + 1,
        title: translate(getExecutionQuoteTypeTitleKey(type)),
        subtitle: type,
      }),
  );
