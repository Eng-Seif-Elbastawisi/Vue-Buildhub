import TitleInterface from '@/base/Data/Models/titleInterface';
import ConfigurationBranchesModel from './configuration.branch.model';

export default class EducationConfigurationModel {
  public readonly educationClassificatioId: TitleInterface<number>;
  public readonly numberOfBranches: number;
  public readonly branches: ConfigurationBranchesModel[];

  constructor(data: {
    educationClassificatioId: TitleInterface<number>;
    numberOfBranches: number;
    branches: ConfigurationBranchesModel[];
  }) {
    this.educationClassificatioId = data.educationClassificatioId;
    this.numberOfBranches = data.numberOfBranches;
    this.branches = data.branches;

    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): EducationConfigurationModel {
    if (!json) {
      throw new Error('Cannot create EducationConfigurationModel from null or undefined');
    }

    return new EducationConfigurationModel({
      educationClassificatioId: (json.education_classification ?? json.education_classification_id) as any,
      numberOfBranches: (json.number_of_branches ?? json.numberOfBranches) as any,
      branches:
        (json.branches as unknown[])?.map((branch: any) =>
          ConfigurationBranchesModel.fromJson(branch as Record<string, any>),
        ) || [],
    });
  }

  static example: EducationConfigurationModel = new EducationConfigurationModel({
    educationClassificatioId: new TitleInterface({ id: 1, title: 'Example' }),
    numberOfBranches: 3,
    branches: [
      new ConfigurationBranchesModel({
        id: 1,
        levelNumber: 1,
        singularTitle: { en: 'Stage', ar: 'مرحلة' },
        pluralTitle: { en: 'Stages', ar: 'مراحل' },
      }),
      new ConfigurationBranchesModel({
        id: 2,
        levelNumber: 2,
        singularTitle: { en: 'Grade', ar: 'صف' },
        pluralTitle: { en: 'Grades', ar: 'صفوف' },
      }),
      new ConfigurationBranchesModel({
        id: 3,
        levelNumber: 3,
        singularTitle: { en: 'Term', ar: 'فصل' },
        pluralTitle: { en: 'Terms', ar: 'فصول' },
      }),
    ],
  });
}
