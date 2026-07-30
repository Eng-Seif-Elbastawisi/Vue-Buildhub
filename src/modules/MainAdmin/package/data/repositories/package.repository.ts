import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';

import PackageModel from '../../core/models/package.model';
import ShowPackageModel from '../../core/models/package.show.model';
import PackageApiService from '../api/package.api-service';

export default class PackageRepository extends BaseRepository<ShowPackageModel, PackageModel[]> {
  private static instance: PackageRepository;

  private constructor() {
    super();
  }

  public static getInstance(): PackageRepository {
    if (!PackageRepository.instance) {
      PackageRepository.instance = new PackageRepository();
    }

    return PackageRepository.instance;
  }

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

  protected get mockItem(): ShowPackageModel {
    return ShowPackageModel.example;
  }

  protected get mockList(): PackageModel[] {
    return [PackageModel.example];
  }

  protected parseItem(rawPackage: Record<string, unknown>): ShowPackageModel {
    return ShowPackageModel.fromJson(rawPackage);
  }

  protected parseList(rawPackages: unknown): PackageModel[] {
    if (!Array.isArray(rawPackages)) {
      return [];
    }

    return rawPackages
      .filter(
        (rawPackage): rawPackage is Record<string, unknown> =>
          rawPackage !== null && typeof rawPackage === 'object' && !Array.isArray(rawPackage),
      )
      .map((rawPackage) => PackageModel.fromJson(rawPackage));
  }
}
