export default class sequenceTreeModel {
  public readonly id?: number;
  public readonly title: string;
  public readonly children?: sequenceTreeModel[];

  constructor(data: { id?: number; title?: string; children?: sequenceTreeModel[] }) {
    this.id = data.id;
    this.title = data.title || '';
    this.children = data.children || [];
    Object.freeze(this);
  }

  static fromJson(json: any): sequenceTreeModel {
    if (!json) {
      throw new Error('Cannot create AnswerModel from null or undefined');
    }

    return new sequenceTreeModel({
      id: json.id,
      title: json.title,
      children: json.children,
    });
  }

  static example: sequenceTreeModel = new sequenceTreeModel({
    id: 1,
    title: 'Cairo',
    children: [],
  });
}
