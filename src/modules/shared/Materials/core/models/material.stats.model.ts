export default class MaterialStatsModel {
  public readonly total?: string;
  public readonly materialCount?: number;

  constructor(data: { total?: string; materialCount?: number }) {
    this.total = data.total ?? '';
    this.materialCount = data.materialCount ?? 0;

    Object.freeze(this);
  }

  static fromJson(json: any): MaterialStatsModel {
    if (!json) {
      throw new Error('Cannot create MaterialStatsModel from null');
    }

    return new MaterialStatsModel({
      total: json.total,
      materialCount: json.materials_count ?? 0,
    });
  }

  static example = new MaterialStatsModel({
    total: 'Example',
    materialCount: 10,
  });
}
