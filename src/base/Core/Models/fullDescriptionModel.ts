export default class FullDescriptionModel {
  public locale: string;
  public fullDescription: string;

  constructor(locale: string, fullDescription: string) {
    this.locale = locale;
    this.fullDescription = fullDescription;
  }

  static fromData(data: any): FullDescriptionModel {
    return new FullDescriptionModel(data.locale, data.full_description);
  }
}
