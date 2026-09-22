import TitleInterface from '@/base/Data/Models/titleInterface';
import { translate } from '@/locales/i18n';

export const ExecutionQuoteItemSourceEnum = {
  PRODUCT: 'product',
  BUILDING_MATERIAL: 'building_material',
  LABOR: 'labor',
} as const;

export type ExecutionQuoteItemSource =
  (typeof ExecutionQuoteItemSourceEnum)[keyof typeof ExecutionQuoteItemSourceEnum];

export const getExecutionQuoteItemSourceTitleKey = (source: ExecutionQuoteItemSource): string => {
  switch (source) {
    case ExecutionQuoteItemSourceEnum.PRODUCT:
      return 'execution_quote.item_sources.product.title';
    case ExecutionQuoteItemSourceEnum.BUILDING_MATERIAL:
      return 'execution_quote.item_sources.building_material.title';
    case ExecutionQuoteItemSourceEnum.LABOR:
      return 'execution_quote.item_sources.labor.title';
    default:
      return 'unknown';
  }
};

export const getExecutionQuoteItemSourceOptions = (): TitleInterface<ExecutionQuoteItemSource>[] =>
  Object.values(ExecutionQuoteItemSourceEnum).map(
    (source, index) =>
      new TitleInterface<ExecutionQuoteItemSource>({
        id: index + 1,
        title: translate(getExecutionQuoteItemSourceTitleKey(source)),
        subtitle: source,
      }),
  );
