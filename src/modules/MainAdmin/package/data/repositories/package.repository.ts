import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import PackageModel from '../../core/models/package.model';
import PackageApiService from '../api/package.api-service';

export default class PackageRepository extends BaseRepository<PackageModel, PackageModel[]> {
  private static instance: PackageRepository;

  protected get apiService(): PackageApiService {
    return PackageApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): PackageModel {
    return PackageModel.example;
  }

  protected get mockList(): PackageModel[] {
    return [PackageModel.example];
  }

  static getInstance(): PackageRepository {
    if (!PackageRepository.instance) {
      PackageRepository.instance = new PackageRepository();
    }

    return PackageRepository.instance;
  }

  protected parseItem(rawPackage: unknown): PackageModel {
    return PackageModel.fromJson(rawPackage);
  }

  protected parseList(rawPackages: unknown): PackageModel[] {
    if (!Array.isArray(rawPackages)) return [];

    return rawPackages.map((rawPackage) => this.parseItem(rawPackage));
  }
}
