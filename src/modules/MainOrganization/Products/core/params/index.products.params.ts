import IndexParams from '@/base/Core/Params/indexParams';

type IndexProductsParamsData = {
  word?: string;
  page?: number;
  perPage?: number;
  withPage?: number;
  dateRemove?: string | null;
  stageIds?: number[];
};

export default class IndexProductsParams extends IndexParams {
  public dateRemove?: string | null;
  public stageIds: number[];

  constructor(params: IndexProductsParamsData = {}) {
    super(params.word ?? '', params.page ?? 1, params.perPage ?? 10, params.withPage ?? 1);
    this.dateRemove = params.dateRemove;
    this.stageIds = [...(params.stageIds ?? [])];
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();
    if (this.dateRemove) data.date_remove = this.dateRemove;
    if (this.stageIds.length) data.stage_ids = this.stageIds;
    return data;
  }
}
