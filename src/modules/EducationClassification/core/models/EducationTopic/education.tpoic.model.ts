export default class EducationTopicModel {
  public readonly id: number;
  public readonly title: string;

  constructor(data: { id: number; title?: string }) {
    this.id = data.id;
    this.title = data.title ?? '';
    Object.freeze(this);
  }

  static fromJson(json: Record<string, any>): EducationTopicModel {
    if (!json) {
      throw new Error('Cannot create EducationSkillsModel from null or undefined');
    }
    return new EducationTopicModel({
      id: json.id as number,
      title: json.title as string,
    });
  }

  static example: EducationTopicModel = new EducationTopicModel({
    id: 1,
    title: 'Math',
  });


}
