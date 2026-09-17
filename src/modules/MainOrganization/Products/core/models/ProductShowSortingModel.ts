export default class ProductShowSortingModel {
  public readonly id?: number;

  public readonly title: string;

  public readonly price: number;

  constructor(data: {
    id?: number;
    title?: string;
    price?: number;
  }) {
    this.id = data.id;
    this.title = data.title ?? '';
    this.price = data.price ?? 0;

    Object.freeze(this);
  }

  static fromJson(json: any): ProductShowSortingModel {
    if (!json) {
      throw new Error(
        'Cannot create ProductShowSortingModel from null or undefined',
      );
    }

    return new ProductShowSortingModel({
      id: json.id,
      title: json.title,
      price:
        json.price != null
          ? Number(json.price)
          : 0,
    });
  }
}