export const ArticleGeneratedByEnum = {
  manual: 1,
  ai: 2,
} as const;

export type ArticleGeneratedByEnum = (typeof ArticleGeneratedByEnum)[keyof typeof ArticleGeneratedByEnum];
