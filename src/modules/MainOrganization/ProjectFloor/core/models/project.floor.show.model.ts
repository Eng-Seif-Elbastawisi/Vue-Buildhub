export type ProjectFloorSelectItem = {
  id: number;
  title: string;
};

export default class ProjectFloorShowModel {
  public readonly id?: number;
  public readonly engineer?: ProjectFloorSelectItem | null;
  public readonly engineer_id?: number;
  public readonly preview_date?: string;
  public readonly preview_time?: string;
  public readonly site_link?: string;
  public readonly address?: string;

  constructor(data: {
    id?: number;
    engineer?: ProjectFloorSelectItem | null;
    engineer_id?: number;
    preview_date?: string;
    preview_time?: string;
    site_link?: string;
    address?: string;
  }) {
    this.id = data.id;
    this.engineer = data.engineer;
    this.engineer_id = data.engineer_id;
    this.preview_date = data.preview_date;
    this.preview_time = data.preview_time;
    this.site_link = data.site_link;
    this.address = data.address;

    Object.freeze(this);
  }

  static mapSelectItem(item: any): ProjectFloorSelectItem | null {
    if (!item) return null;

    return {
      id: Number(item.id),
      title: item.name || item.title || `#${item.id}`,
    };
  }

  static fromJson(json: Record<string, unknown>): ProjectFloorShowModel {
    if (!json) {
      throw new Error('Cannot create ProjectFloorShowModel from null or undefined');
    }

    const engineer = ProjectFloorShowModel.mapSelectItem(json.engineer);

    return new ProjectFloorShowModel({
      id: json.id as number | undefined,
      engineer,
      engineer_id: engineer?.id ?? (json.engineer_id as number | undefined),
      preview_date: json.preview_date as string | undefined,
      preview_time: json.preview_time as string | undefined,
      site_link: json.site_link as string | undefined,
      address: json.address as string | undefined,
    });
  }

  static example = new ProjectFloorShowModel({
    id: 1,
    engineer: {
      id: 15,
      title: 'Site engineer',
    },
    engineer_id: 15,
    preview_date: '2026-06-25',
    preview_time: '10:30:00',
    site_link: 'https://maps.google.com/?q=30.0444,31.2357',
    address: 'Nasr City, Cairo, Egypt',
  });
}
