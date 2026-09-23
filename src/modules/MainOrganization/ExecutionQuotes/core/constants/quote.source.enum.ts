export const QuoteSourceEnum = {
  EXECUTION_ONLY: 1,
  EXECUTION_FROM_DESIGN_QUOTE: 2,
} as const;

export type QuoteSourceEnum = (typeof QuoteSourceEnum)[keyof typeof QuoteSourceEnum];

export const getQuoteSourceTitleKey = (source: QuoteSourceEnum | undefined): string => {
  if (source === QuoteSourceEnum.EXECUTION_ONLY) {
    return 'execution_quote.sources.execution_only.title';
  }

  if (source === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE) {
    return 'execution_quote.sources.design_quote.title';
  }

  return '';
};
