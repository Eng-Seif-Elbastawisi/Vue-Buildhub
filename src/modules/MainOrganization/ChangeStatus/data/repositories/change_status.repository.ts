import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import ChangeStatusApiService from '../api/change_status.api-service';
import ChangeStatusModel from '../../core/models/client.model';
import type Params from '@/base/Core/Params/params';

export default class ChangeStatusRepository extends BaseRepository<ChangeStatusModel, ChangeStatusModel> {
  private static instance: ChangeStatusRepository;

  protected get apiService() {
    return ChangeStatusApiService.getInstance();
  }

  static getInstance(): ChangeStatusRepository {
    if (!ChangeStatusRepository.instance) {
      ChangeStatusRepository.instance = new ChangeStatusRepository();
    }
    return ChangeStatusRepository.instance;
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: false,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected parseItem(data: any): ChangeStatusModel {
    return ChangeStatusModel.fromJson(data);
  }

  protected parseList(_data: unknown): never {
    throw new Error('ChangeStatusRepository does not support list operations');
  }


  async changeStatus(params: Params) {
    return super.executeCustom(
      () => this.apiService.changeStatus(params),
      () => ChangeStatusModel.example,
    );
  }


}
