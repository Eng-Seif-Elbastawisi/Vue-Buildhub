import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import TermModel from '../../core/models/term.model';
import TermShowModel from '../../core/models/term.show.model';
import TermApiService from '../api/term.api-service';

export default class TermRepository extends BaseRepository<TermShowModel, TermModel[]> {
  private static instance: TermRepository;
  protected get apiService() {
    return TermApiService.getInstance();
  }
  protected get config(): RepositoryConfig {
    return { hasPagination: true, dataKey: 'data', paginationKey: 'meta' };
  }
  protected get mockItem() {
    return TermShowModel.example;
  }
  protected get mockList() {
    return [TermModel.example];
  }

  static getInstance(): TermRepository {
    if (!TermRepository.instance) TermRepository.instance = new TermRepository();
    return TermRepository.instance;
  }

  protected parseItem(data: Record<string, unknown>): TermShowModel {
    return TermShowModel.fromJson(data);
  }
  protected parseList(data: unknown): TermModel[] {
    return Array.isArray(data) ? data.map((item) => TermModel.fromJson(item)) : [];
  }
}
