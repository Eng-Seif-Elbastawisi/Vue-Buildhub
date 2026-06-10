import AttachmentModel from './attachment.model';

export default class SolutionHintModel {
  public readonly id?: number;
  public readonly hint: string;
  public readonly attachments: AttachmentModel[];

  constructor(data: { id?: number; hint?: string; attachments?: AttachmentModel[] }) {
    this.id = data.id;
    this.hint = data.hint || '';
    this.attachments = data.attachments || [];
    Object.freeze(this);
  }

  static fromJson(json: any): SolutionHintModel {
    if (!json) {
      throw new Error('Cannot create AnswerModel from null or undefined');
    }

    return new SolutionHintModel({
      id: json.question_answer_hint_id,
      hint: json.text,
      attachments: json.attachments,
    });
  }

  static example: SolutionHintModel = new SolutionHintModel({
    id: 1,
    hint: 'Hint',
    attachments: [AttachmentModel.example],
  });
}
