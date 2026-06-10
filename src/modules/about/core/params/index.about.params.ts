import IndexParams from '@/base/Core/Params/indexParams';

export default class IndexAboutParams extends IndexParams {
  public isLocale: boolean;
  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    isLocale?: boolean | undefined,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.isLocale = isLocale ?? false;
  }

  toMap(): Record<string, string | number | number[] | null> {
    return super.toMap();
  }
}
