import IndexParams from '@/base/Core/Params/indexParams';
import { type BrandTypeEnum } from '../constant/Brand.type.enum';

export default class IndexBrandParams extends IndexParams {
  dateRemove: string | null | undefined;
  type: BrandTypeEnum | null | undefined;
  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    dateRemove?: string | null,
    type?: BrandTypeEnum | null,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.dateRemove = dateRemove;
    this.type = type;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();
    if (this.dateRemove) {
      data['date_remove'] = this.dateRemove;
    }
    if (this.type) {
      data['type'] = this.type;
    }

    return data;
  }
}
