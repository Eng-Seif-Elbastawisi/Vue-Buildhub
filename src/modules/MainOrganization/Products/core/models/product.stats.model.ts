export default class ProductStatsModel {
  public readonly productsCount?: number;
  public readonly hasSortingCount?: number;
  public readonly hasNotSortingCount?: number;

  constructor(data: {
    productsCount?: number;
    hasSortingCount?: number;
    hasNotSortingCount?: number;
  }) {
    this.productsCount = data.productsCount ?? 0;
    this.hasSortingCount = data.hasSortingCount ?? 0;
    this.hasNotSortingCount = data.hasNotSortingCount ?? 0;

    Object.freeze(this);
  }

  static fromJson(json: any): ProductStatsModel {
    if (!json) {
      throw new Error('Cannot create ProductStatsModel from null');
    }

    console.log(json, 'json');

    return new ProductStatsModel({
      productsCount: json.products_count,
      hasSortingCount: json.has_sorting_count,
      hasNotSortingCount: json.has_not_sorting_count,
    });
  }

  static example = new ProductStatsModel({
    productsCount: 5,
    hasSortingCount: 4,
    hasNotSortingCount: 1,
  });
}
