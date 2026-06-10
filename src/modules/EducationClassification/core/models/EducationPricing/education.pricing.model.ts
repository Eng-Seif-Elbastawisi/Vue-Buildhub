/**
 * Education Pricing model representing a category of education
 */
export default class EducationPricingModel {
  public readonly id: number;
  public readonly duration: number;
  public readonly price: number;

  constructor(data: { id: number; duration: number; price: number }) {
    this.id = data.id;
    this.duration = data.duration;
    this.price = data.price;

    Object.freeze(this);
  }

  /**
   * Create EducationClassificationModel from API response
   * @param json - Raw JSON data from API
   * @returns EducationClassificationModel instance
   */
  static fromJson(json: Record<string, unknown>): EducationPricingModel {
    if (!json) {
      throw new Error('Cannot create EducationClassificationModel from null or undefined');
    }

    return new EducationPricingModel({
      id: json.id as number,
      duration: json.duration as number,
      price: json.price as number,
    });
  }

  static example: EducationPricingModel = new EducationPricingModel({
    id: 1,
    duration: 3,
    price: 300,
  });
}
