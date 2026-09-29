import { QuoteStatusEnum } from '../constants/quote.status.enum';

export default class QuoteStatusModel {
  public readonly id?: number;
  public readonly quoteId?: number;
  public readonly status?: QuoteStatusEnum;
  public readonly notes?: string;
  public readonly createdAt?: string;

  constructor(data: {
    id?: number;
    quoteId?: number;
    status?: QuoteStatusEnum;
    notes?: string;
    createdAt?: string;
  }) {
    this.id = data.id;
    this.quoteId = data.quoteId;
    this.status = data.status;
    this.notes = data.notes;
    this.createdAt = data.createdAt;

    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): QuoteStatusModel {
    if (!json) {
      throw new Error('Cannot create QuoteStatusModel from null or undefined');
    }

    return new QuoteStatusModel({
      id: json.id as number | undefined,
      quoteId: (json.quote_id || json.execution_quote_id) as number | undefined,
      status: json.status as QuoteStatusEnum | undefined,
      notes: json.notes as string | undefined,
      createdAt: json.created_at as string | undefined,
    });
  }
}
