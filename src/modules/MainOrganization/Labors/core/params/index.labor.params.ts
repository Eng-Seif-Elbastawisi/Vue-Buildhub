import IndexParams from '@/base/Core/Params/indexParams';

interface IndexLaborOptions {
  word?: string;
  pageNumber?: number;
  perPage?: number;
  withPage?: number;
  active?: 0 | 1;
}

export default class IndexLaborParams extends IndexParams {
  public active?: 0 | 1;

  constructor(options: IndexLaborOptions = {}) {
    super(
      options.word ?? '',
      options.pageNumber ?? 1,
      options.perPage ?? 10,
      options.withPage ?? 1,
    );
    this.active = options.active;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const query = super.toMap();
    if (this.active !== undefined) query.active = this.active;
    return query;
  }
}
