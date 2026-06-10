import TitleInterface from '@/base/Data/Models/titleInterface';
import type AttachmentModel from './attachment.model';

export default class QuestionClarificationModel {
  public readonly documents?: TitleInterface<number>;
  public readonly source?: string;
  public readonly clarification?: string;
  public readonly attachments?: AttachmentModel[];

  constructor(data: {
    documents?: TitleInterface<number>;
    source?: string;
    clarification?: string;
    attachments?: AttachmentModel[];
  }) {
    this.documents = data.documents;
    this.source = data.source || '';
    this.clarification = data.clarification || '';
    this.attachments = data.attachments || [];
    Object.freeze(this);
  }

  static fromJson(json: any): QuestionClarificationModel {
    if (!json) {
      throw new Error('Cannot create AnswerModel from null or undefined');
    }

    return new QuestionClarificationModel({
      documents: new TitleInterface<number>({
        id: json.document_id,
        title: '',
      }),
      source: json.source_text,
      clarification: json.explanation,
      attachments: json.attachments,
    });
  }

  static example: QuestionClarificationModel = new QuestionClarificationModel({
    documents: new TitleInterface<number>({
      id: 2,
      title: 'a',
    }),
    source: 'Source',
    clarification: 'Clarification',
    attachments: [{  alt: '', file: 'https://cyber.comolho.com/static/img/avatar.png', }],
  });
}
