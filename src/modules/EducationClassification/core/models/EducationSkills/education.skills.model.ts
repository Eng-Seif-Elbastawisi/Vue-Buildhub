import type TitleInterface from '@/base/Data/Models/titleInterface';

export default class EducationSkillsModel {
  public readonly id: number;
  public readonly percentage: number;
  public readonly time: number;
  public readonly skill: TitleInterface<number>;

  constructor(data: {
    id: number;
    percentage: number;
    time: number;
    skill?: TitleInterface<number>;
  }) {
    this.id = data.id;
    this.percentage = data.percentage;
    this.time = data.time;
    this.skill = data.skill ?? { id: 0, title: '' };
    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): EducationSkillsModel {
    if (!json) {
      throw new Error('Cannot create EducationSkillsModel from null or undefined');
    }
    return new EducationSkillsModel({
      id: json.id as number,
      percentage: json.percentage as number,
      time: json.time as number,
      skill: json.skill as TitleInterface<number>,
    });
  }

  static example: EducationSkillsModel = new EducationSkillsModel({
    id: 1,
    percentage: 80,
    time: 60,
    skill: { id: 1, title: 'Math' },
  });
}
