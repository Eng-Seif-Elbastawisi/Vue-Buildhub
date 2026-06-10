import IndexParams from '@/base/Core/Params/indexParams';

export default class IndexPrivacyParams extends IndexParams {
  public allLocales: boolean;
  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    allLocales: boolean = false,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.allLocales = allLocales;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();
    return data;
  }
}
