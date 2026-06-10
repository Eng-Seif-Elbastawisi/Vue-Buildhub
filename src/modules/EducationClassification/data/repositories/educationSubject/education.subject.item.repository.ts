import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import EducationSubjectItemApiService from '../../api/education.subject/education.subject.item.api-service';
import EducationSubjectModel from '@/modules/EducationClassification/core/models/EducationSubject/education.subject.model';

export default class EducationSubjectItemRepository extends BaseRepository<
  EducationSubjectModel,
  EducationSubjectModel[]
> {
  private static instance: EducationSubjectItemRepository;

  protected get apiService() {
    return EducationSubjectItemApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  static getInstance(): EducationSubjectItemRepository {
    if (!EducationSubjectItemRepository.instance) {
      EducationSubjectItemRepository.instance = new EducationSubjectItemRepository();
    }
    return EducationSubjectItemRepository.instance;
  }

  protected parseItem(data: unknown): EducationSubjectModel {
    return EducationSubjectModel.fromJson(data as Record<string, unknown>);
  }

  protected parseList(data: unknown): EducationSubjectModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: EducationSubjectModel[], item) => {
      try {
        if (item != null) acc.push(this.parseItem(item));
      } catch {}
      return acc;
    }, []);
  }
}
