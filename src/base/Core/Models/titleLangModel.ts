export default class TitleLangModel {
  public title: string;
  public locale: string;

  constructor(title: string, locale: string) {
    this.title = title;
    this.locale = locale;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromData(data: any): TitleLangModel {
    return new TitleLangModel(data.title, data.locale);
  }
}
