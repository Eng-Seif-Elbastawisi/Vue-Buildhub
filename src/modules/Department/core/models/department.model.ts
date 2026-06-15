import TitleInterface from '@/base/Data/Models/titleInterface';

export default class DepartmentModel {
  public readonly id?: number;
  public readonly title: string;
  public readonly stage: TitleInterface<number>;

  constructor(data: { id?: number; title: string; stage: TitleInterface<number> }) {
    this.id = data.id;
    this.title = data.title;
    this.stage = data.stage;
    Object.freeze(this);
  }

  static fromJson(json: unknown): DepartmentModel {
    if (!json || typeof json !== 'object') {
      throw new Error('Cannot create DepartmentModel from invalid data');
    }
    const data = json as {
      id?: number;
      title: string;
      stage?: { id?: number; title?: string };
      stage_id?: number;
      stage_title?: string;
    };

    return new DepartmentModel({
      id: data.id,
      title: data.title,
      stage: new TitleInterface({
        id: data.stage?.id ?? data.stage_id ?? 0,
        title: data.stage?.title ?? data.stage_title ?? '',
      }),
    });
  }

  static example(): DepartmentModel {
    return new DepartmentModel({
      id: 1,
      title: 'Engineering',
      stage: new TitleInterface({
        id: 1,
        title: 'Engineering',
      }),
    });
  }
}
