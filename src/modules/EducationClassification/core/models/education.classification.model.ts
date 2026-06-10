/**
 * Education Classification model representing a category of education
 */
export default class EducationClassificationModel {
  public readonly id: number;
  public readonly title: string;
  public readonly created_at: string;
  public readonly status: boolean;
  public readonly has_configuration: boolean;
  public readonly has_configuration_subjct: boolean;

  constructor(data: {
    id: number;
    title: string;
    created_at: string;
    status: boolean;
    has_configuration: boolean;
    has_configuration_subjct: boolean;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.created_at = data.created_at;
    this.status = data.status;
    this.has_configuration = data.has_configuration;
    this.has_configuration_subjct = data.has_configuration_subjct;

    Object.freeze(this);
  }

  /**
   * Create EducationClassificationModel from API response
   * @param json - Raw JSON data from API
   * @returns EducationClassificationModel instance
   */
  static fromJson(json: Record<string, unknown>): EducationClassificationModel {
    if (!json) {
      throw new Error('Cannot create EducationClassificationModel from null or undefined');
    }

    return new EducationClassificationModel({
      id: json.id as number,
      title: json.title as string,
      created_at: json.created_at as string,
      status: json.status as boolean,
      has_configuration: json.has_configurations as boolean,
      has_configuration_subjct: json.has_configuration_subjct as boolean,
    });
  }

  static example: EducationClassificationModel = new EducationClassificationModel({
    id: 1,
    title: 'Basic education',
    created_at: '2022-01-01',
    status: true,
    has_configuration: true,
    has_configuration_subjct: true,
  });
}
