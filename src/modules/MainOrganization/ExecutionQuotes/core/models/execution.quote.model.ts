export default class ExecutionQuoteModel {
  public readonly id?: number;
  public readonly quoteSource?: number;
  public readonly projectId?: number;
  public readonly clientId?: number;
  public readonly quoteTypeId?: number;
  public readonly priceEmployeeId?: number;

  constructor(modelData: {
    id?: number;
    quoteSource?: number;
    projectId?: number;
    clientId?: number;
    quoteTypeId?: number;
    priceEmployeeId?: number;
  }) {
    this.id = modelData.id;
    this.quoteSource = modelData.quoteSource;
    this.projectId = modelData.projectId;
    this.clientId = modelData.clientId;
    this.quoteTypeId = modelData.quoteTypeId;
    this.priceEmployeeId = modelData.priceEmployeeId;

    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ExecutionQuoteModel {
    if (!json) {
      throw new Error('Cannot create ExecutionQuoteModel from null or undefined');
    }

    return new ExecutionQuoteModel({
      id: typeof json.id === 'number' ? json.id : Number(json.id) || undefined,
      quoteSource: ExecutionQuoteModel.toNumber(json.quote_source ?? json.quoteSource),
      projectId: ExecutionQuoteModel.toNumber(json.project_id ?? json.projectId),
      clientId: ExecutionQuoteModel.toNumber(json.client_id ?? json.clientId),
      quoteTypeId: ExecutionQuoteModel.toNumber(json.quote_type_id ?? json.quoteTypeId),
      priceEmployeeId: ExecutionQuoteModel.toNumber(json.price_employee_id ?? json.priceEmployeeId),
    });
  }

  private static toNumber(rawValue: unknown): number | undefined {
    if (rawValue === undefined || rawValue === null || rawValue === '') return undefined;

    const numberValue = Number(rawValue);
    return Number.isFinite(numberValue) ? numberValue : undefined;
  }

  static example = new ExecutionQuoteModel({
    id: 1,
    quoteSource: 1,
    projectId: 10,
    clientId: 5,
    quoteTypeId: 2,
    priceEmployeeId: 7,
  });
}
