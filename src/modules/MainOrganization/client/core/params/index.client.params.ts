import IndexParams from '@/base/Core/Params/indexParams';

export default class IndexClientParams extends IndexParams {
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
    // if (this.dateRemove) {
    //   data['date_remove'] = this.dateRemove;
    // }
    // if (this.unit) {
    //   data['unit'] = this.unit;
    // }

    return data;
  }
}
