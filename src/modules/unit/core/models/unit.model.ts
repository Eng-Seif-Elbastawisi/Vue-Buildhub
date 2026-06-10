import TitleInterface from "@/base/Data/Models/titleInterface";

/**
 * Unit model representing an educational unit
 */
export default class UnitModel {
  public readonly id?: number;
  public readonly title: string;
  public readonly Subject: TitleInterface<number>;
  public readonly Stage: TitleInterface<number>;

  constructor(data: {
    id?: number;
    title: string;
    Subject: TitleInterface<number>;
    Stage: TitleInterface<number>;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.Subject = data.Subject;
    this.Stage = data.Stage;

    Object.freeze(this);
  }

  /**
   * Create UnitModel from API response
   * @param json - Raw JSON data from API
   * @returns UnitModel instance
   */
  static fromJson(json: any): UnitModel {
    if (!json) {
      throw new Error("Cannot create UnitModel from null or undefined");
    }

    return new UnitModel({
      id: json.id,
      title: json.title,
      Subject: new TitleInterface({
        id: json.subject?.id ?? json.subject,
        title: json.subject?.title ?? "Unknown Subject",
      }),
      Stage: new TitleInterface({
        id: json.stage?.id ?? json.stage,
        title: json.stage?.title ?? "Unknown Stage",
      }),
    });
  }

  static example: UnitModel = new UnitModel({
    id: 1,
    title: "الوحدة الأولى",
    Subject: new TitleInterface({
      id: 1,
      title: "الرياضيات",
    }),
    Stage: new TitleInterface({
      id: 1,
      title: "المرحلة الثانوية",
    }),
  });
}
