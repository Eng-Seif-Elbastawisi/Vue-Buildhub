export const QuestionStatusEnum = {
  not_Reviewd: 1,
  under_review: 2,
  rejected: 3,
  approved: 4,
} as const;

export type QuestionStatusEnum = (typeof QuestionStatusEnum)[keyof typeof QuestionStatusEnum];
