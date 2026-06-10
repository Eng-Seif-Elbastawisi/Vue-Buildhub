export default class DescriptionModel {
  public locale: string;
  public description: string;

  constructor(locale: string, description: string) {
    this.locale = locale;
    this.description = description;
  }

  static fromData(data: any): DescriptionModel {
    return new DescriptionModel(data.locale, data.description);
  }
}
