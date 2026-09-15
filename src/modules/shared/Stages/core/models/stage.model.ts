import TitleInterface from '@/base/Data/Models/titleInterface';
import { EducationType } from '../constants/educationtype.enum';
import BranchesModel from './branches.model';

/**
 * Country model representing a nation's geographical and cultural data
 */
export default class StageModel {
  public readonly id?: number;
  public readonly title: string;
  public readonly translations: { title: Record<string, string> };
  // public readonly full_title: string;
  public readonly e_c_subject_id?: number;

  public readonly branches: BranchesModel[];
  public readonly EducationType: TitleInterface<EducationType>;
  public readonly children: StageModel[];
   public readonly status : boolean;

  constructor(data: {
    id?: number;
    translations?: { title: Record<string, string> };
    title?: string;
    e_c_subject_id?: number;
    branches: BranchesModel[];
    EducationType: TitleInterface<EducationType>;
    children: StageModel[];
    status?: boolean;
  }) {
    this.id = data.id;
    this.translations = data.translations ?? { title: { en: data.title ?? '' } };
    this.title =
      data.title ?? this.translations.title.en ?? Object.values(this.translations.title)[0] ?? '';
    this.e_c_subject_id = data.e_c_subject_id;
    this.branches = data.branches;
    this.EducationType = data.EducationType;
    this.children = data.children;
    this.status = data.status ?? false;
    Object.freeze(this);
  }

  /**
   * Create CountryModel from API response
   * @param json - Raw JSON data from API
   * @returns CountryModel instance
   */
  static mapTranslations(translations: unknown, key: string = 'title'): Record<string, string> {
    if (!Array.isArray(translations)) {
      const value = translations as { title?: Record<string, string> } | undefined;
      return value?.title ?? (translations as Record<string, string>) ?? {};
    }

    return translations.reduce<Record<string, string>>((result, translation) => {
      const item = translation as Record<string, string>;
      if (item.locale && item[key]) result[item.locale] = item[key];
      return result;
    }, {});
  }

  static fromJson(json: any): StageModel {
    if (!json) {
      throw new Error('Cannot create StageModel from null or undefined');
    }

    return new StageModel({
      id: json.id,
      title: json.title,
      translations: { title: StageModel.mapTranslations(json.title) },
      e_c_subject_id: json.e_c_subject_id,
      branches: json.branches?.map((branch: any) => BranchesModel.fromJson(branch)) ?? [],
      EducationType: json.education_type,
      children: json.children?.map((child: any) => StageModel.fromJson(child)) ?? [],
      status: json.status,
    });
  }

  static example: StageModel = new StageModel({
    id: 1,
    translations: { title: { en: 'title', ar: 'title' } },
    branches: [BranchesModel.example],
    EducationType: new TitleInterface({
      id: EducationType.General,
      title: 'General',
    }),
    children: [],
  });
}
