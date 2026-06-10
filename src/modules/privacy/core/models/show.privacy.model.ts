
/**
 * Country model representing a nation's geographical and cultural data
 */
export default class ShowPrivacyModel {
  public readonly id: number;
  public readonly title: string;
  public readonly description: string;

  constructor(data: { id: number; title: string; description: string }) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;

    Object.freeze(this);
  }

  /**
   * Create CountryModel from API response
   * @param json - Raw JSON data from API
   * @returns FaqsModel instance
   */
  static fromJson(json: any): ShowPrivacyModel {
    if (!json) {
      throw new Error('Cannot create FaqsModel from null or undefined');
    }

    return new ShowPrivacyModel({
      id: json.id,
      title: json.title,
      description: json.description,
    });
  }

  static example: ShowPrivacyModel = new ShowPrivacyModel({
    id: 1,
    title: 'lorem ipsum dolor sit amet consectetur adipiscing elit',
    description: 'lorem ipsum dolor sit amet consectetur adipiscing elit',
  });
}
