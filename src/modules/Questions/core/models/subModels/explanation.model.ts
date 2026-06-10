export default class ExplanationModel {
  public readonly id?: number;
  public readonly explanation: string; 
  public readonly source_text: string;
  public readonly document_id: string;
  public readonly attachments: string[];


  constructor(data: {
    id?: number;
    explanation?: string;
    source_text?: string;
    document_id?: string;
    attachments?: string[];
  }) {
    this.id = data.id;
    this.explanation = data.explanation || '';
    this.source_text = data.source_text || '';
    this.document_id = data.document_id || '';
    this.attachments = data.attachments || [];

    Object.freeze(this);
  }

  static fromJson(json: any): ExplanationModel {
    if (!json) throw new Error('Cannot create ExplanationModel from null or undefined');

    return new ExplanationModel({
  id: json.explanation_id,
  explanation: json.explanation, 
  source_text: json.source_text,
  document_id: json.document_id,
  attachments: json.attachments,
});
  }

  static example: ExplanationModel = new ExplanationModel({
    id: 1,
    explanation: 'What is the capital of Egypt?',
    source_text: 'Egypt',
    document_id: '1',
    attachments: [],
  });
}

