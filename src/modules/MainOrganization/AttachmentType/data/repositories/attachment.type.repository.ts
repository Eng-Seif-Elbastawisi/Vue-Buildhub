import type AttachmentTypeModel from '../../core/models/attachment.type.model';
import type AttachmentTypeShowModel from '../../core/models/attachment.type.show.model';
import AttachmentTypeApiService from '../api/attachment.type.api-service';
import AttachmentTypeModelClass from '../../core/models/attachment.type.model';
import AttachmentTypeShowModelClass from '../../core/models/attachment.type.show.model';
import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';

export default class AttachmentTypeRepository extends BaseRepository<
  AttachmentTypeShowModel,
  AttachmentTypeModel[]
> {
  protected get apiService(): AttachmentTypeApiService {
    return AttachmentTypeApiService.getInstance();
  }
  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }
  protected parseItem(json: Record<string, unknown>): AttachmentTypeShowModel {
    return AttachmentTypeShowModelClass.fromJson(json);
  }

  protected parseList(data: unknown[]): AttachmentTypeModel[] {
    return data.map((item) =>
      AttachmentTypeModelClass.fromJson(item as Record<string, unknown>),
    );
  }
  private static instance: AttachmentTypeRepository;

  private constructor() {
    super();
  }

  static getInstance(): AttachmentTypeRepository {
    if (!AttachmentTypeRepository.instance) {
      AttachmentTypeRepository.instance = new AttachmentTypeRepository();
    }
    return AttachmentTypeRepository.instance;
  }



}
