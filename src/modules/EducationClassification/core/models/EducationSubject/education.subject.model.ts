export default class EducationSubjectModel {
  public readonly subject_id: number;
  public readonly subject_title: string;
  public readonly has_children: boolean;

  constructor(data: { subject_id: number; subject_title: string; has_children: boolean }) {
    this.subject_id = data.subject_id;
    this.subject_title = data.subject_title;
    this.has_children = data.has_children;

    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): EducationSubjectModel {
    if (!json) {
      throw new Error('Cannot create EducationSubjectModel from null or undefined');
    }

    return new EducationSubjectModel({
      subject_id: json.id as number,
      subject_title: json.title as string,
      has_children: json.has_children as boolean,
    });
  }
}
