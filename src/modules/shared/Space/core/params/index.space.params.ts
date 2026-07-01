import IndexParams from '@/base/Core/Params/indexParams';

export default class IndexSpaceParams extends IndexParams {
  public dateRemove?: string | null;

  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    dateRemove?: string | null,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.dateRemove = dateRemove;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();
    if (this.dateRemove) data.date_remove = this.dateRemove;
    return data;
  }
}
