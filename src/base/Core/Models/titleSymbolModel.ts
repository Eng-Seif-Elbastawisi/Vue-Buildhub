export default class TitleSymbolModel {
  public id: number;
  public title: string;
  public symbol: string;

  constructor(id: number, title: string, symbol: string) {
    this.id = id;
    this.title = title;
    this.symbol = symbol;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromMap(data: any): TitleSymbolModel {
    return new TitleSymbolModel(
      data.id,
      data.title,
      data.symbol ? data.symbol : data.title,
    );
  }
}
