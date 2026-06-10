import IndexParams from '@/base/Core/Params/indexParams';

export default class IndexSupportContactsParams extends IndexParams {
  public allLocale:boolean
  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    allLocale: boolean = false,
    withPage: number = 1,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.allLocale = allLocale;
  }

  toMap(): Record<string, string | number | number[] | null> {
    return super.toMap();
  }
}
