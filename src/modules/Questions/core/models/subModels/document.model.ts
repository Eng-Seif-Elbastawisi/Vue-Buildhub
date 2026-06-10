export default class DocumentArticleModel {
  public readonly document_id?: number;
  public readonly document_title: string; 
  public readonly text: string;

  constructor(data: {
    document_id?: number;
    document_title?: string;
    text?: string;
  }) {
    this.document_id = data.document_id;
    this.document_title = data.document_title || '';
    this.text = data.text || '';

    Object.freeze(this);
  }

  static fromJson(json: any): DocumentArticleModel {
    if (!json) throw new Error('Cannot create DocumentArticleModel from null or undefined');

    return new DocumentArticleModel({
  document_id: json.document_id,
  document_title: json.document_title, 
  text: json.text,
});
  }

  static example: DocumentArticleModel = new DocumentArticleModel({
    document_id: 1,
    document_title: 'Document 1',
    text: 'text',
  });
}

