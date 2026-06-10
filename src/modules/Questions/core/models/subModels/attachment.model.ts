
export default class AttachmentModel {
  public id?: number;
  public file?: string;
  public alt?: string;


  constructor(data: {
    id?: number;
    file?: string;
    alt?: string;
  }) {
    this.id = data.id;
    this.file = data.file || '';
    this.alt = data.alt || '';

    Object.freeze(this);
  }

  static fromJson(json: any): AttachmentModel {
    if (!json) {
      throw new Error('Cannot create AttachmentModel from null or undefined');
    }

    return new AttachmentModel({
      id: json.id,
      file: json.file,
      alt: json.alt,
    });
  }

  static example: AttachmentModel = new AttachmentModel({
    file: `https://cyber.comolho.com/static/img/avatar.png`,
    alt: 'Attachment Alt Text',
  });
}
