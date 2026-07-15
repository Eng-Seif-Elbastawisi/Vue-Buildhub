import IndexParams from '@/base/Core/Params/indexParams';
import type { DepartmentTypeEnum } from '../constants/Type.enum';

type IndexDepartmentParamsData = {
  word?: string;
  page?: number;
  perPage?: number;
  withPage?: number;
  type?: DepartmentTypeEnum;
};

export default class IndexDepartmentParams extends IndexParams {
  public type?: DepartmentTypeEnum;

  constructor(data?: IndexDepartmentParamsData);
  constructor(
    word?: string,
    pageNumber?: number,
    perPage?: number,
    withPage?: number,
    type?: DepartmentTypeEnum,
  );
  constructor(
    dataOrWord: IndexDepartmentParamsData | string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    type?: DepartmentTypeEnum,
  ) {
    if (typeof dataOrWord === 'object') {
      super(
        dataOrWord.word ?? '',
        dataOrWord.page ?? 1,
        dataOrWord.perPage ?? 10,
        dataOrWord.withPage ?? 1,
      );
      this.type = dataOrWord.type;
      return;
    }

    super(dataOrWord, pageNumber, perPage, withPage);
    this.type = type;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();

    if (this.type !== undefined) {
      data.type = this.type;
    }

    return data;
  }
}
