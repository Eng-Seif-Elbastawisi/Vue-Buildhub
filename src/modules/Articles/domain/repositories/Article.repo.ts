import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type Params from '@/base/Core/Params/params';
import type { questionsModel } from '@/modules/Questions';

/**
 * Interface for Employee Repository
 */
export default interface IArticleRepo {
  index(params?: Params): Promise<DataState<questionsModel[]>>;
  show(params: Params): Promise<DataState<questionsModel>>;
  create(params: Params): Promise<DataState<questionsModel>>;
  update(params: Params): Promise<DataState<questionsModel>>;
  delete(params: Params): Promise<DataState<void>>;
}
