import IndexParams from '@/base/Core/Params/indexParams';

export default class IndexFaqsParams extends IndexParams {
  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
  ) {
    super(word, pageNumber, perPage, withPage);
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();
    return data;
  }
}
