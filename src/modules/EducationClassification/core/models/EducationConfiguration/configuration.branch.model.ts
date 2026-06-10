import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for adding a new country
 */
export default class ConfigurationBranchesModel {
  levelNumber: number;
  id: number;
  pluralTitle: Record<string, string>;
  singularTitle: Record<string, string>;

  public static readonly validation = new ClassValidation().setRules({
    levelNumber: { required: true },
  });

  constructor(data: {
    levelNumber: number;
    id: number;
    pluralTitle: Record<string, string>;
    singularTitle: Record<string, string>;
  }) {
    this.id = data.id;
    this.levelNumber = data.levelNumber;
    this.pluralTitle = data.pluralTitle;
    this.singularTitle = data.singularTitle;
  }

  static fromJson(json: any): ConfigurationBranchesModel {
    if (!json) {
      throw new Error('Cannot create EducationConfigurationModel from null or undefined');
    }

    return new ConfigurationBranchesModel({
      id: json.id as number,
      levelNumber: (json.level_number || json.levelNumber) as number,
      singularTitle: ConfigurationBranchesModel.normalizeLocaleField(json.singular_title, 'singular_title'),
      pluralTitle: ConfigurationBranchesModel.normalizeLocaleField(json.plural_title, 'plural_title'),
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

  static example: ConfigurationBranchesModel = new ConfigurationBranchesModel({
    id: 1,
    levelNumber: 1,
    pluralTitle: {
      en: 'en',
      ar: 'ar',
    },
    singularTitle: {
      en: 'en',
      ar: 'ar',
    },
  });
}
