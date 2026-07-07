import { ProjectPricingDiscountEnum } from '../constant/project.pricing.discount.enum';

export default class ProjectPricingModel {
  public readonly id?: number;
  public readonly total_tax?: number;
  public readonly discount_type?: ProjectPricingDiscountEnum;
  public readonly discount_value?: number;
  public readonly price_after_discount?: number;

  constructor(data: {
    id?: number;
    total_tax?: number;
    discount_type?: ProjectPricingDiscountEnum;
    discount_value?: number;
    price_after_discount?: number;
  }) {
    this.id = data.id;
    this.total_tax = data.total_tax;
    this.discount_type = data.discount_type;
    this.discount_value = data.discount_value;
    this.price_after_discount = data.price_after_discount;
    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ProjectPricingModel {
    if (!json) throw new Error('Cannot create ProjectPricingModel from null or undefined');

    return new ProjectPricingModel({
      id: json.id as number | undefined,
      total_tax: json.total_tax as number | undefined,
      discount_type: json.discount_type as ProjectPricingDiscountEnum | undefined,
      discount_value: json.discount_value as number | undefined,
      price_after_discount: json.price_after_discount as number | undefined,
    });
  }

  static example: ProjectPricingModel = new ProjectPricingModel({
    id: 10,
    total_tax: 10,
    discount_type: ProjectPricingDiscountEnum.FIXED,
    discount_value: 10,
    price_after_discount: 10,
  });
}
