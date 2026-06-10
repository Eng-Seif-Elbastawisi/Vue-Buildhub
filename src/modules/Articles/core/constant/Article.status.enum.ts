export const ArticleStatusEnum = {
  not_Reviewd: 1,
  under_review: 2,
  rejected: 3,
  approved: 4,
} as const;

export type ArticleStatusEnum = (typeof ArticleStatusEnum)[keyof typeof ArticleStatusEnum];
