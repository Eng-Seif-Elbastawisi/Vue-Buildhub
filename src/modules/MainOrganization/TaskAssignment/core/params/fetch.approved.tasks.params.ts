// import type Params from "@/base/Core/Params/params";

import IndexParams from "@/base/Core/Params/indexParams";



export default class FetchApprovedTasksParams extends IndexParams {
  public readonly isAssign: number;

  constructor(word: string = '', page: number = 1, perPage: number = 10, withPagination: number = 1, isAssign: number = 0) {
    super(word, page, perPage, withPagination);
    this.isAssign = isAssign;
  }

  toMap(): Record<string, number | string> {
    return {
      ...super.toMap(),
      is_assign: this.isAssign,
    };
  }
}
