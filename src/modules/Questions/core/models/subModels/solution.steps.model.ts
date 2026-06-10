import AttachmentModel from './attachment.model';

export default class SolutionStepsModel {
  public readonly id?: number;
  public readonly step: string;
  public readonly attachments: AttachmentModel[];

  constructor(data: { id?: number; step?: string; attachments?: AttachmentModel[] }) {
    this.id = data.id;
    this.step = data.step || '';
    this.attachments = data.attachments || [];
    Object.freeze(this);
  }

  static fromJson(json: any): SolutionStepsModel {
    if (!json) {
      throw new Error('Cannot create AnswerModel from null or undefined');
    }

    return new SolutionStepsModel({
      id: json.question_answer_hint_id,
      step: json.text,
      attachments: json.attachments,
    });
  }

  static example: SolutionStepsModel = new SolutionStepsModel({
    id: 1,
    step: 'steps',
    attachments: [AttachmentModel.example],
  });
}
