import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import TermApiService from '../api/term.api-service';
import TermModel from '../../core/models/term.model';

export default class TermRepository extends BaseRepository<TermModel, TermModel[]> {
  private static instance: TermRepository;

  protected get apiService() {
    return TermApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return { hasPagination: true, dataKey: 'data', paginationKey: 'meta' };
  }

  protected get mockItem(): TermModel {
    return TermModel.example();
  }

  protected get mockList(): TermModel[] {
    return [TermModel.example(), TermModel.example(), TermModel.example()];
  }

  protected parseItem(data: unknown): TermModel {
    return TermModel.fromJson(data);
  }

  protected parseList(data: unknown): TermModel[] {
    if (!Array.isArray(data)) return [];
    return data.filter(Boolean).map((item) => this.parseItem(item));
  }

  static getInstance(): TermRepository {
    if (!TermRepository.instance) TermRepository.instance = new TermRepository();
    return TermRepository.instance;
  }
}
