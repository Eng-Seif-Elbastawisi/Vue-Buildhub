import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import EmployeeModel from '../../core/models/employee.model';
import EmployeeApiService from '../api/employee.api-service';

export default class EmployeeRepository extends BaseRepository<EmployeeModel, EmployeeModel[]> {
  private static instance: EmployeeRepository;

  protected get apiService() {
    return EmployeeApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): EmployeeModel {
    return EmployeeModel.example;
  }

  protected get mockList(): EmployeeModel[] {
    return [EmployeeModel.example];
  }

  static getInstance(): EmployeeRepository {
    if (!EmployeeRepository.instance) {
      EmployeeRepository.instance = new EmployeeRepository();
    }
    return EmployeeRepository.instance;
  }

  protected parseItem(data: any): EmployeeModel {
    return EmployeeModel.fromJson(data);
  }

  protected parseList(data: any): EmployeeModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: EmployeeModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
