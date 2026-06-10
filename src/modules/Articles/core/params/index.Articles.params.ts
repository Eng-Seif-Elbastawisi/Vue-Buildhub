import IndexParams from '@/base/Core/Params/indexParams';
import type { ArticleStatusEnum } from '../constant/Article.status.enum';
import type { ArticleGeneratedByEnum } from '../constant/Article.generatedby.enum';
import type { ArticleTypeEnum } from '../constant/Article.type.enum';
import type { ArticleDifficultyEnum } from '../constant/Article.difficulty.enum';
import { ArticleQuestionTypeEnum } from '../constant/Article.question.type.enum';

export default class IndexArticleParams extends IndexParams {
  public status?: ArticleStatusEnum;
  public generated_by?: ArticleGeneratedByEnum;
  public article_type?: ArticleTypeEnum;
  public difficulty?: ArticleDifficultyEnum;
  public question_type?: ArticleQuestionTypeEnum;
  constructor(data: {
    word: string;
    pageNumber: number;
    perPage: number;
    withPage: number;
    status?: ArticleStatusEnum;
    generated_by?: ArticleGeneratedByEnum;
    article_type?: ArticleTypeEnum;
    difficulty?: ArticleDifficultyEnum;
    question_type?: ArticleQuestionTypeEnum;
  }) {
    super(data.word, data.pageNumber, data.perPage, data.withPage);
    this.status = data.status;
    this.generated_by = data.generated_by;
    this.article_type = data.article_type;
    this.difficulty = data.difficulty;
    this.question_type = data.question_type??ArticleQuestionTypeEnum.PARAGRAPH; 
  }

  toMap(): Record<string, any> {
    return {
      ...super.toMap(),
      ...(this.status ? { status: this.status } : {}),
      ...(this.generated_by ? { generated_by: this.generated_by } : {}),
      ...(this.article_type ? { article_type: this.article_type } : {}),
      ...(this.difficulty ? { difficulty: this.difficulty } : {}),
      ...(this.question_type ? { question_type: this.question_type } : {}),
    };
  }
}
 