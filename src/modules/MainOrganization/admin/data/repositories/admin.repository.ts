import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import AdminModel from '../../core/models/admin.model';
import AdminApiService from '../api/admin.api-service';

export default class AdminRepository extends BaseRepository<AdminModel, AdminModel[]> {
  private static instance: AdminRepository;

  protected get apiService() {
    return AdminApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): AdminModel {
    return AdminModel.example;
  }

  protected get mockList(): AdminModel[] {
    return [AdminModel.example];
  }

  static getInstance(): AdminRepository {
    if (!AdminRepository.instance) {
      AdminRepository.instance = new AdminRepository();
    }
    return AdminRepository.instance;
  }

  protected parseItem(data: any): AdminModel {
    return AdminModel.fromJson(data);
  }

  protected parseList(data: any): AdminModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: AdminModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
