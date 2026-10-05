import TitleInterface from '@/base/Data/Models/titleInterface';

export default class ExecutionQuoteProjectModel {
  public readonly id?: number;
  public readonly client?: TitleInterface<number>;
  public readonly title?: string;
  public readonly description?: string | null;
  public readonly date?: string;
  public readonly createdAt?: string;

  constructor(data: {
    id?: number;
    client?: TitleInterface<number>;
    title?: string;
    description?: string | null;
    date?: string;
    createdAt?: string;
  }) {
    this.id = data.id;
    this.client = data.client;
    this.title = data.title;
    this.description = data.description;
    this.date = data.date;
    this.createdAt = data.createdAt;

    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ExecutionQuoteProjectModel {
    const client = json.client as Record<string, unknown> | undefined;

    return new ExecutionQuoteProjectModel({
      id: json.id as number | undefined,
      client: client
        ? new TitleInterface<number>({
            id: Number(client.id),
            title: client.title as string | undefined,
          })
        : undefined,
      title: json.title as string | undefined,
      description: json.description as string | null | undefined,
      date: json.date as string | undefined,
      createdAt: json.created_at as string | undefined,
    });
  }
}
