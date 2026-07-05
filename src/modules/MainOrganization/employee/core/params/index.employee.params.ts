import IndexParams from '@/base/Core/Params/indexParams';

export default class IndexEmployeeParams extends IndexParams {
  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    public type?: number,
  ) {
    super(word, pageNumber, perPage, withPage);
  }

  toMap(): Record<string, string | number | number[] | null> {
    return {
      ...super.toMap(),
      ...(this.type !== undefined ? { type: this.type } : {}),
    };
  }
}
