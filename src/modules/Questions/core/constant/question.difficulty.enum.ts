export const QuestionDifficultyEnum = {
  easy: 1,
  medium: 2,
  hard: 3,
} as const;

export type QuestionDifficultyEnum = (typeof QuestionDifficultyEnum)[keyof typeof QuestionDifficultyEnum];
