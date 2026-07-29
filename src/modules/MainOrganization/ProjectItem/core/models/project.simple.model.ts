import TitleInterface from '@/base/Data/Models/titleInterface';

export default class ProjectSimpleModel {
  public readonly id?: number;
  public readonly client?: TitleInterface<number>;
  public readonly title?: {
    locale: string;
    title: string;
  }[];
  public readonly description?: {
    locale: string;
    description: string | null;
  }[];
  public readonly date?: string;
  public readonly created_at?: string;

  constructor(data: {
    id?: number;
    client?: TitleInterface<number>;
    title?: {
      locale: string;
      title: string;
    }[];
    description?: {
      locale: string;
      description: string | null;
    }[];
    date?: string;
    created_at?: string;
  }) {
    this.id = data.id;
    this.client = data.client;
    this.title = data.title;
    this.description = data.description;
    this.date = data.date;
    this.created_at = data.created_at;

    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ProjectSimpleModel {
    const client = json.client as
      | {
          id?: number;
          title?: string;
        }
      | undefined;

    return new ProjectSimpleModel({
      id: json.id as number | undefined,

      client: client
        ? new TitleInterface({
            id: client.id as number,
            title: client.title as string,
          })
        : undefined,

      title: json.title as
        | {
            locale: string;
            title: string;
          }[]
        | undefined,

      description: json.description as
        | {
            locale: string;
            description: string | null;
          }[]
        | undefined,

      date: json.date as string | undefined,
      created_at: json.created_at as string | undefined,
    });
  }
}