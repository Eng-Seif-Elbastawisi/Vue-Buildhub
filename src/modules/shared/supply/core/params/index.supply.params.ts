import IndexParams from '@/base/Core/Params/indexParams';
import { type UnitTypeEnum } from '../constant/unit.type.enum';

export default class IndexSupplyParams extends IndexParams {
  dateRemove: string | null | undefined;
  unit: UnitTypeEnum | null | undefined;
  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    dateRemove?: string | null,
    unit?: UnitTypeEnum | null,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.dateRemove = dateRemove;
    this.unit = unit;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();
    if (this.dateRemove) {
      data['date_remove'] = this.dateRemove;
    }
    if (this.unit) {
      data['unit'] = this.unit;
    }

    return data;
  }
}
