import IndexParams from '@/base/Core/Params/indexParams';
import { type EmployeeType } from '../constants/type.enum';
export default class IndexEmployeeParams extends IndexParams {
  type?: EmployeeType;
  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    type?: EmployeeType,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.type = type;
  }

  toMap(): Record<string, string | number | number[] | null> {
    return {
      ...super.toMap(),
      ...(this.type ? { type: this.type } : {}),
    };
  }
}
