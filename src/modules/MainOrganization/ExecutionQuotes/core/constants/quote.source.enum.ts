export const QuoteSourceEnum = {
  EXECUTION_ONLY: 1,
  EXECUTION_FROM_DESIGN_QUOTE: 2,
} as const;

export type QuoteSourceEnum = (typeof QuoteSourceEnum)[keyof typeof QuoteSourceEnum];
