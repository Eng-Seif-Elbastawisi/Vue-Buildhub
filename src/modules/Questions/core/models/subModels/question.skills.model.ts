export default class QuestionSkillsModel {
  public readonly id?: number;
  public readonly skill: string;
  public readonly precentage?: number;

  constructor(data: { id?: number; skill?: string; precentage?: number }) {
    this.id = data.id;
    this.skill = data.skill || '';
    this.precentage = data.precentage || 0;
    Object.freeze(this);
  }

  static fromJson(json: any): QuestionSkillsModel {
    if (!json) {
      throw new Error('Cannot create AnswerModel from null or undefined');
    }

    return new QuestionSkillsModel({
      id: json.skill_id,
      skill: json.title,
      precentage: json.percentage,
    });
  }

  static example: QuestionSkillsModel = new QuestionSkillsModel({
    id: 2,
    skill: 'Document 2',
    precentage: 10,
  });
}
