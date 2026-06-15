import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import DepartmentModel from '../../core/models/department.model';
import DepartmentApiService from '../api/department.api-service';

export default class DepartmentRepository extends BaseRepository<
  DepartmentModel,
  DepartmentModel[]
> {
  private static instance: DepartmentRepository;

  protected get apiService() {
    return DepartmentApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return { hasPagination: true, dataKey: 'data', paginationKey: 'meta' };
  }

  protected get mockItem(): DepartmentModel {
    return DepartmentModel.example();
  }

  protected get mockList(): DepartmentModel[] {
    return [DepartmentModel.example(), DepartmentModel.example(), DepartmentModel.example()];
  }

  protected parseItem(data: unknown): DepartmentModel {
    return DepartmentModel.fromJson(data);
  }

  protected parseList(data: unknown): DepartmentModel[] {
    if (!Array.isArray(data)) return [];
    return data.filter(Boolean).map((item) => this.parseItem(item));
  }

  static getInstance(): DepartmentRepository {
    if (!DepartmentRepository.instance) DepartmentRepository.instance = new DepartmentRepository();
    return DepartmentRepository.instance;
  }
}
