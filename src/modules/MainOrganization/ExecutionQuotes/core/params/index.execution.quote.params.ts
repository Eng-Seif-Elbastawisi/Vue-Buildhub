import IndexParams from '@/base/Core/Params/indexParams';

export type IndexExecutionQuoteParamsData = {
  word?: string;
  page?: number;
  perPage?: number;
  withPage?: number;
  quoteSource?: number;
  projectId?: number;
  clientId?: number;
  quoteTypeId?: number;
};

export default class IndexExecutionQuoteParams extends IndexParams {
  public readonly quoteSource?: number;
  public readonly projectId?: number;
  public readonly clientId?: number;
  public readonly quoteTypeId?: number;

  constructor(data: IndexExecutionQuoteParamsData = {}) {
    super(data.word ?? '', data.page ?? 1, data.perPage ?? 20, data.withPage ?? 1);

    this.quoteSource = data.quoteSource;
    this.projectId = data.projectId;
    this.clientId = data.clientId;
    this.quoteTypeId = data.quoteTypeId;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const query = super.toMap();

    if (this.quoteSource) query.quote_source = this.quoteSource;
    if (this.projectId) query.project_id = this.projectId;
    if (this.clientId) query.client_id = this.clientId;
    if (this.quoteTypeId) query.quote_type_id = this.quoteTypeId;

    return query;
  }
}
