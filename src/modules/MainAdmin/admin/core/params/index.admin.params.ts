import IndexParams from '@/base/Core/Params/indexParams';

export default class IndexAdminParams extends IndexParams {
  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
  ) {
    super(word, pageNumber, perPage, withPage);
  }

  toMap(): Record<string, string | number | number[] | null> {
    return super.toMap();
  }
}
