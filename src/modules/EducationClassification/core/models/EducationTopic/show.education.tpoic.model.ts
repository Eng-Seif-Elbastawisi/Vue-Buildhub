export default class ShowEducationTopicModel {
  public readonly id: number;
  public readonly titles: Record<string, string>;

  constructor(data: { id: number; titles?: Record<string, string> }) {
    this.id = data.id;
    this.titles = data.titles ?? {};
    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ShowEducationTopicModel {
    if (!json) {
      throw new Error('Cannot create EducationSkillsModel from null or undefined');
    }
    return new ShowEducationTopicModel({
      id: json.id as number,
      titles: this.mapTranslations(json.titles as any, 'title'),
    });
  }
  static mapTranslations = (translations: any[], key: string = 'value') => {
    const result: Record<string, string> = {};
    if (Array.isArray(translations)) {
      translations.forEach((t: any) => {
        if (t.locale && t[key]) {
          result[t.locale] = t[key];
        }
      });
    }
    return result;
  };
  static example: ShowEducationTopicModel = new ShowEducationTopicModel({
    id: 1,
    titles: {
      en: 'Math',
      ar: 'الرياضيات',
    },
  });
}
