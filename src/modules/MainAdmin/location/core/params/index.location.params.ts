import IndexParams from '@/base/Core/Params/indexParams';
import { type LocationTypeEnum } from '../constant/location.type.enum';

export default class IndexLocationParams extends IndexParams {
  dateRemove: string | null | undefined;
  type: LocationTypeEnum | null | undefined;
  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    dateRemove?: string | null,
    type?: LocationTypeEnum | null,
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
