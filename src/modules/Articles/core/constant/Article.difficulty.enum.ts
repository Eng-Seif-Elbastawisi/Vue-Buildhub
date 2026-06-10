export const ArticleDifficultyEnum = {
  easy: 1,
  medium: 2,
  hard: 3,
} as const;

export type ArticleDifficultyEnum = (typeof ArticleDifficultyEnum)[keyof typeof ArticleDifficultyEnum];
