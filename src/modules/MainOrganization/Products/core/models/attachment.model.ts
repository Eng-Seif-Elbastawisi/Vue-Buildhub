export default class AttachmentModel {
  public readonly id?: number;
  public readonly file: string;
  public readonly type: number;

  constructor(data: {
    id?: number;
    file?: string;
    type?: number;
  }) {
    this.id = data.id;
    this.file = data.file ?? '';
    this.type = data.type ?? 0;

    Object.freeze(this);
  }

  static fromJson(json: any): AttachmentModel {
    if (!json) {
      throw new Error(
        'Cannot create AttachmentModel from null or undefined',
      );
    }

    return new AttachmentModel({
      id: json.id,
      file: json.file,
      type: json.type,
    });
  }
}