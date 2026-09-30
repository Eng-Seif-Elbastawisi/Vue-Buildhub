import { QuoteStatusEnum } from '../constants/quote.status.enum';

export interface QuoteStatusEmployee {
  id?: number;
  name?: string;
}

const parseQuoteStatus = (rawStatus: unknown): QuoteStatusEnum | undefined => {
  const status = Number(rawStatus);

  return Object.values(QuoteStatusEnum).includes(status as QuoteStatusEnum)
    ? (status as QuoteStatusEnum)
    : undefined;
};

export default class QuoteStatusModel {
  public readonly id?: number;
  public readonly employee: QuoteStatusEmployee | null;
  public readonly fromStatus?: QuoteStatusEnum;
  public readonly toStatus?: QuoteStatusEnum;
  public readonly note: string | null;
  public readonly createdAt?: string;

  constructor(data: {
    id?: number;
    employee?: QuoteStatusEmployee | null;
    fromStatus?: QuoteStatusEnum;
    toStatus?: QuoteStatusEnum;
    note?: string | null;
    createdAt?: string;
  }) {
    this.id = data.id;
    this.employee = data.employee ?? null;
    this.fromStatus = data.fromStatus;
    this.toStatus = data.toStatus;
    this.note = data.note ?? null;
    this.createdAt = data.createdAt;

    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): QuoteStatusModel {
    if (!json) {
      throw new Error('Cannot create QuoteStatusModel from null or undefined');
    }

    const employee =
      json.employee && typeof json.employee === 'object'
        ? (json.employee as Record<string, unknown>)
        : undefined;

    return new QuoteStatusModel({
      id: json.id as number | undefined,
      employee: employee
        ? {
            id: employee.id as number | undefined,
            name: employee.name as string | undefined,
          }
        : null,
      fromStatus: parseQuoteStatus(json.from_status),
      toStatus: parseQuoteStatus(json.to_status),
      note: typeof json.note === 'string' ? json.note : null,
      createdAt: json.created_at as string | undefined,
    });
  }
}
