import type TitleInterface from '@/base/Data/Models/titleInterface';
import ConfigurationBranchesModel from './configuration.branch.model';

export default class EducationSubjectConfigurationModel {
  public readonly educationClassification: TitleInterface<number>;
  public readonly numberOfBranches: number;
  public readonly pluralTitle: Record<string, string>;
  public readonly SingluarTitle: Record<string, string>;
  public readonly branches: ConfigurationBranchesModel[];

  constructor(data: {
    educationClassification: TitleInterface<number>;
    numberOfBranches: number;
    pluralTitle: Record<string, string>;
    SingluarTitle: Record<string, string>;
    branches: ConfigurationBranchesModel[];
  }) {
    this.educationClassification = data.educationClassification;
    this.numberOfBranches = data.numberOfBranches;
    this.pluralTitle = data.pluralTitle;
    this.SingluarTitle = data.SingluarTitle;
    this.branches = data.branches;

    Object.freeze(this);
  }

  static fromJson(json: any): EducationSubjectConfigurationModel {
    if (!json) {
      throw new Error('Cannot create EducationSubjectConfigurationModel from null or undefined');
    }

    return new EducationSubjectConfigurationModel({
      pluralTitle: EducationSubjectConfigurationModel.normalizeLocaleField(json.plural_title, 'plural_title'),
      SingluarTitle: EducationSubjectConfigurationModel.normalizeLocaleField(json.singular_title, 'singular_title'),
      educationClassification: json.education_classification,
      numberOfBranches: json.number_of_branches,
      branches:
        (json.branches as Record<string, unknown>[])?.map((branch: Record<string, unknown>) =>
          ConfigurationBranchesModel.fromJson(branch),
        ) || [],
    });
  }

  private static normalizeLocaleField(
    raw: unknown,
    valueKey: string,
  ): Record<string, string> {
    if (Array.isArray(raw)) {
      return (raw as Array<Record<string, string>>).reduce(
        (acc, item) => {
          if (item?.locale) acc[item.locale] = item[valueKey] ?? '';
          return acc;
        },
        {} as Record<string, string>,
      );
    }
    if (raw && typeof raw === 'object') return raw as Record<string, string>;
    return {};
  }

  static example: EducationSubjectConfigurationModel = new EducationSubjectConfigurationModel({
    educationClassification: {
      id: 1,
      title: 'aa',
    },
    numberOfBranches: 2,
    pluralTitle: { en: 'title 1 ', ar: 'title 1 ' },
    SingluarTitle: { en: 'title 1 ', ar: 'title 1 ' },
    branches: [ConfigurationBranchesModel.example, ConfigurationBranchesModel.example],
  });
}
