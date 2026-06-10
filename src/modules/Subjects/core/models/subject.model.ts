import TitleInterface from "@/base/Data/Models/titleInterface";

/**
 * Subject model representing an educational subject
 */
export default class SubjectModel {
  public readonly id?: number;
  public readonly title: string;
  public readonly Stage: TitleInterface<number>;

  constructor(data: {
    id?: number;
    title: string;
    Stage: TitleInterface<number>;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.Stage = data.Stage;

    Object.freeze(this);
  }

  /**
   * Create SubjectModel from API response
   * @param json - Raw JSON data from API
   * @returns SubjectModel instance
   */
  static fromJson(json: any): SubjectModel {
    if (!json) {
      throw new Error("Cannot create SubjectModel from null or undefined");
    }

    return new SubjectModel({
      id: json.id,
      title: json.title,
      Stage: new TitleInterface({
        id: json.stage?.id ?? json.stage,
        title: json.stage?.title ?? "Unknown Stage",
      }),
    });
  }

  static example: SubjectModel = new SubjectModel({
    id: 1,
    title: "الرياضيات",
    Stage: new TitleInterface({
      id: 1,
      title: "المرحلة الثانوية",
    }),
  });
}
