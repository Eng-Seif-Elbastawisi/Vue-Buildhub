export const QuestionTypeEnum = {
  mcq: 1,
  ranking: 6,
  true_false: 2,
  complate: 3,
  matching: 4,
} as const;

export type QuestionTypeEnum = (typeof QuestionTypeEnum)[keyof typeof QuestionTypeEnum];
