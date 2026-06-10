import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import LoginModel from '../../core/models/user.model';
import LoginApiService from '../api/login.api-service';
import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

/**
 * Email Repository for API data operations
 *
 * This repository handles all data access for employee emails,
 * including parsing API responses and error handling.
 */
export default class LoginRepository extends BaseRepository<LoginModel, never> {
  private static instance: LoginRepository;

  protected get apiService() {
    return LoginApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  /**
   * Get singleton instance
   * @returns EmailRepository instance
   */
  static getInstance(): LoginRepository {
    if (!LoginRepository.instance) {
      LoginRepository.instance = new LoginRepository();
    }
    return LoginRepository.instance;
  }

  protected parseItem(data: unknown): LoginModel {
    return LoginModel.fromJson(data);
  }

  protected parseList(_data: unknown): never {
    throw new Error('LoginRepository does not support list operations');
  }

  async login(params: Params): Promise<DataState<LoginModel>> {
    return this.executeCustom(
      () => this.apiService.login(params),
      (data) => this.parseItem(data),
    );
  }

  protected get mockItem(): LoginModel {
    return LoginModel.example;
  }
}
