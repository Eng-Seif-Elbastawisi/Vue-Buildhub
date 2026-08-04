export const InsideStatusDecision = {
  ACCEPT: 5,
  REJECT: 6,
} as const;

export type InsideStatusDecisionValue =
  (typeof InsideStatusDecision)[keyof typeof InsideStatusDecision];
