export const ArticleQuestionTypeEnum = {
  PARAGRAPH:5,
} as const;

export type ArticleQuestionTypeEnum = (typeof ArticleQuestionTypeEnum)[keyof typeof ArticleQuestionTypeEnum];
