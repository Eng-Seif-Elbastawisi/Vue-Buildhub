export default class SubjectTreeModel {
  public readonly id?: number;
  public readonly title: string;
  public readonly children?: SubjectTreeModel[];

  constructor(data: { id?: number; title?: string; children?: SubjectTreeModel[] }) {
    this.id = data.id;
    this.title = data.title || '';
    this.children = data.children || [];
    Object.freeze(this);
  }

  static fromJson(json: any): SubjectTreeModel {
    if (!json) {
      throw new Error('Cannot create AnswerModel from null or undefined');
    }

    return new SubjectTreeModel({
      id: json.id,
      title: json.title,
      children: json.children,
    });
  }

  static example: SubjectTreeModel = new SubjectTreeModel({
    id: 1,
    title: 'Cairo',
    children: [],
  });
}
