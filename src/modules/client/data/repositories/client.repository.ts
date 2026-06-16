import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import ClientApiService from '../api/client.api-service';
import ClientModel from '../../core/models/client.model';
import ClientShowModel from '../../core/models/client.show.model';

export default class ClientRepository extends BaseRepository<ClientShowModel, ClientModel[]> {
  private static instance: ClientRepository;

  protected get apiService() {
    return ClientApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): ClientShowModel {
    return ClientShowModel.example;
  }

  protected get mockList(): ClientModel[] {
    return [{ ...ClientModel.example }, { ...ClientModel.example }];
  }

  static getInstance(): ClientRepository {
    if (!ClientRepository.instance) {
      ClientRepository.instance = new ClientRepository();
    }
    return ClientRepository.instance;
  }

  protected parseItem(data: any): ClientShowModel {
    return ClientShowModel.fromJson(data);
  }

  protected parseList(data: any): ClientModel[] {
    if (!Array.isArray(data)) return [];

    return data.map((item) => ClientModel.fromJson(item));
  }
}
