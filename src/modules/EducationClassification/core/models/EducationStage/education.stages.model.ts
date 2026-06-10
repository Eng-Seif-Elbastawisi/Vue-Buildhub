export default class EducationStageModel {
  public readonly stage_id: number;
  public readonly stage_title: string;
  public readonly has_children: boolean;
  public readonly status: number;

  constructor(data: {
    stage_id: number;
    stage_title: string;
    has_children: boolean;
    status: number;
  }) {
    this.stage_id = data.stage_id;
    this.stage_title = data.stage_title;
    this.has_children = data.has_children;
    this.status = data.status;

    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): EducationStageModel {
    if (!json) {
      throw new Error('Cannot create BranchesModel from null or undefined');
    }

    return new EducationStageModel({
      stage_id: (json.id ?? json.stage_id) as number,
      stage_title: (json.title ?? json.stage_title) as string,
      has_children: json.has_children as boolean,
      status: json.status as number,
    });
  }

  static example: EducationStageModel = new EducationStageModel({
    has_children: true,
    stage_id: 10,
    stage_title: 'stage 1',
    status: 1 || 2, // 1 or 2
  });
}
