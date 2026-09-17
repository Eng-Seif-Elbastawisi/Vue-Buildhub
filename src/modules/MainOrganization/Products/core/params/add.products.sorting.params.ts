export default class AddProductsSortingModel {
  public title: string;
  public price: number;

  constructor(data: { title: string; price: number }) {
    this.title = data.title;
    this.price = data.price;

    Object.freeze(this);
  }

  toMap(): Record<string, unknown> {
    return {
      title: this.title,
      price: this.price,
    };
  }
}
