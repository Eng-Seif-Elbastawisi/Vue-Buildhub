import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type Params from '@/base/Core/Params/params';
import type ArticleAnswerModel from '@/modules/Articles/core/models/subModels/Article.answer.model';

/**
 * Interface for Employee Repository
 */
export default interface IArticleRepo {
  index(params?: Params): Promise<DataState<ArticleAnswerModel[]>>;
  show(params: Params): Promise<DataState<ArticleAnswerModel>>;
  create(params: Params): Promise<DataState<ArticleAnswerModel>>;
  update(params: Params): Promise<DataState<ArticleAnswerModel>>;
  delete(params: Params): Promise<DataState<void>>;
}
