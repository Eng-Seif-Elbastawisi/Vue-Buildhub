import IndexParams from '@/base/Core/Params/indexParams';

type IndexStageParamsData = {
  word?: string;
  page?: number;
  perPage?: number;
  withPage?: number;
  parentId?: number | null;
  departmentId?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  status?: boolean;
};

export default class IndexStageParams extends IndexParams {
  public parentId?: number | null;
  public departmentId?: number;
  public sortBy?: string;
  public sortDirection?: 'asc' | 'desc';
  public status?: boolean;

  constructor(data?: IndexStageParamsData);
  constructor(
    word?: string,
    pageNumber?: number,
    perPage?: number,
    withPage?: number,
    parentId?: number | null,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc',
    status?: boolean,
  );

  constructor(
    dataOrWord: IndexStageParamsData | string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    parentId?: number | null,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc',
    status?: boolean,
  ) {
    if (typeof dataOrWord === 'object') {
      super(
        dataOrWord.word ?? '',
        dataOrWord.page ?? 1,
        dataOrWord.perPage ?? 10,
        dataOrWord.withPage ?? 1,
      );

      this.parentId = dataOrWord.parentId;
      this.departmentId = dataOrWord.departmentId;
      this.sortBy = dataOrWord.sortBy;
      this.sortDirection = dataOrWord.sortDirection;
      this.status = dataOrWord.status;
      return;
    }

    super(dataOrWord, pageNumber, perPage, withPage);
    this.parentId = parentId;
    this.sortBy = sortBy;
    this.sortDirection = sortDirection;
    this.status = status;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();

    if (this.parentId !== undefined) {
      data.parent_id = this.parentId;
    }

    if (this.departmentId !== undefined) {
      data.department_id = this.departmentId;
    }

    if (this.sortBy) data.sort_by = this.sortBy;
    if (this.sortDirection) data.sort_direction = this.sortDirection;
    if (this.status !== undefined) data.status = Number(this.status);

    return data;
  }
}
