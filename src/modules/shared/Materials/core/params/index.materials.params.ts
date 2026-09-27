import IndexParams from '@/base/Core/Params/indexParams';
import { type UnitTypeEnum } from '../constant/unit.type.enum';

type IndexMaterialParamsData = {
  word?: string;
  page?: number;
  perPage?: number;
  withPage?: number;
  dateRemove?: string | null;
  unit?: UnitTypeEnum | null;
  status?: boolean;
};

export default class IndexMaterialParams extends IndexParams {
  dateRemove: string | null | undefined;
  unit: UnitTypeEnum | null | undefined;
  status?: boolean;

  constructor(data?: IndexMaterialParamsData);
  constructor(
    word?: string,
    pageNumber?: number,
    perPage?: number,
    withPage?: number,
    dateRemove?: string | null,
    unit?: UnitTypeEnum | null,
  );

  constructor(
    dataOrWord: IndexMaterialParamsData | string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    dateRemove?: string | null,
    unit?: UnitTypeEnum | null,
  ) {
    if (typeof dataOrWord === 'object') {
      super(
        dataOrWord.word ?? '',
        dataOrWord.page ?? 1,
        dataOrWord.perPage ?? 10,
        dataOrWord.withPage ?? 1,
      );
      this.dateRemove = dataOrWord.dateRemove;
      this.unit = dataOrWord.unit;
      this.status = dataOrWord.status;
      return;
    }

    super(dataOrWord, pageNumber, perPage, withPage);
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
    if (this.status !== undefined) {
      data.status = Number(this.status);
    }

    return data;
  }
}
