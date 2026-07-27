
export default class ProjectAttachmentModel {
  id?: number;
  file?: string;
  file_size?: string;
  alt?: string | null;
  type?: number;
  link?: string | null;
  created_at?: string;



  constructor(data: {
    id?: number;
    file?: string;
    file_size?: string;
    alt?: string | null;
    type?: number;
    link?: string | null;
    created_at?: string;
  }) {
    this.id = data.id;
    this.file = data.file;
    this.file_size = data.file_size;
    this.alt = data.alt;
    this.type = data.type;
    this.link = data.link;
    this.created_at = data.created_at;

    Object.freeze(this);
  }


  static fromJson(json: Record<string, unknown>): ProjectAttachmentModel {
    if (!json) {
      throw new Error('Cannot create ProjectShowModel from null or undefined');
    }

    return new ProjectAttachmentModel({
      id: json.id as number | undefined,
      file: json.file as string,
      file_size: json.file_size as string | undefined,
      alt: json.alt as string | null | undefined,
      type: json.type as number | undefined,
      link: json.link as string | null | undefined,
      created_at: json.created_at as string | undefined,  
    });
  }

  static example = new ProjectAttachmentModel({
    id: 1,
    file: 'file.pdf',
    file_size: '1.5 MB',
    alt: 'Project attachment',
    type: 1,
    link: 'https://example.com/file.pdf',
    created_at: '2023-01-01 12:00:00',
  });
}

        

