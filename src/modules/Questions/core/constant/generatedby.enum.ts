export const QuestionGeneratedByEnum = {
  manual: 1,
  ai: 2,
} as const;

export type QuestionGeneratedByEnum = (typeof QuestionGeneratedByEnum)[keyof typeof QuestionGeneratedByEnum];
