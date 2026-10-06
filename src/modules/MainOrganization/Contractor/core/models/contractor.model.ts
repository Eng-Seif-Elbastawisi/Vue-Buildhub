import StageModel from '@/modules/shared/Stages/core/models/stage.model';

export default class ContractorModel {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly stageIds: number[],
    public readonly stages: StageModel[],
  ) {}

  static fromJson(json: Record<string, unknown>): ContractorModel {
    const stages = Array.isArray(json.stages)
      ? json.stages.map((stage) => StageModel.fromJson(stage))
      : [];
    const stageIds = Array.isArray(json.stage_ids)
      ? json.stage_ids.map(Number)
      : stages.flatMap((stage) => (stage.id === undefined ? [] : [stage.id]));

    return new ContractorModel(Number(json.id), String(json.name ?? ''), stageIds, stages);
  }

  static example = new ContractorModel(1, 'Contractor', [], []);
}
