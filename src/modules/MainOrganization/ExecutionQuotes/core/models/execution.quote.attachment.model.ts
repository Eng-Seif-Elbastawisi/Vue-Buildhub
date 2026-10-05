export default class ExecutionQuoteAttachmentModel {
  public readonly id?: number;
  public readonly file?: string;
  public readonly fileSize?: string;
  public readonly alt?: string | null;
  public readonly link?: string | null;
  public readonly createdAt?: string;

  constructor(data: {
    id?: number;
    file?: string;
    fileSize?: string;
    alt?: string | null;
    link?: string | null;
    createdAt?: string;
  }) {
    this.id = data.id;
    this.file = data.file;
    this.fileSize = data.fileSize;
    this.alt = data.alt;
    this.link = data.link;
    this.createdAt = data.createdAt;

    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ExecutionQuoteAttachmentModel {
    return new ExecutionQuoteAttachmentModel({
      id: json.id as number | undefined,
      file: json.file as string | undefined,
      fileSize: json.file_size as string | undefined,
      alt: json.alt as string | null | undefined,
      link: json.link as string | null | undefined,
      createdAt: json.created_at as string | undefined,
    });
  }
}
