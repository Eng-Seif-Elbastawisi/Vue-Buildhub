export type ProjectSelectItem = {
  id: number;
  title: string;
};

export default class ProjectPreviewShowModel {
  public readonly id?: number;
  public readonly project_preview_id?: number;
  public readonly project?: ProjectSelectItem | null;
  public readonly project_id?: number;
  public readonly engineer?: ProjectSelectItem | null;
  public readonly engineer_id?: number;
  public readonly preview_date?: string;
  public readonly preview_time?: string;
  public readonly site_link?: string | null;
  public readonly address?: string | null;
  public readonly status?: number | null;
  public readonly notification_type?: number | null;
  public readonly notification_message?: string | null;
  public readonly pricing_responsible?: ProjectSelectItem | null;
  public readonly pricing_responsible_id?: number;

  constructor(data: {
    id?: number;
    project_preview_id?: number;
    project?: ProjectSelectItem | null;
    project_id?: number;
    engineer?: ProjectSelectItem | null;
    engineer_id?: number;
    preview_date?: string;
    preview_time?: string;
    site_link?: string | null;
    address?: string | null;
    status?: number | null;
    notification_type?: number | null;
    notification_message?: string | null;
    pricing_responsible?: ProjectSelectItem | null;
    pricing_responsible_id?: number;
  }) {
    this.id = data.id;
    this.project_preview_id = data.project_preview_id;
    this.project = data.project;
    this.project_id = data.project_id;
    this.engineer = data.engineer;
    this.engineer_id = data.engineer_id;
    this.preview_date = data.preview_date;
    this.preview_time = data.preview_time;
    this.site_link = data.site_link;
    this.address = data.address;
    this.status = data.status;
    this.notification_type = data.notification_type;
    this.notification_message = data.notification_message;
    this.pricing_responsible = data.pricing_responsible;
    this.pricing_responsible_id = data.pricing_responsible_id;

    Object.freeze(this);
  }

  static mapSelectItem(item: unknown): ProjectSelectItem | null {
    if (!item || typeof item !== 'object') return null;

    const data = item as Record<string, unknown>;
    const id = ProjectPreviewShowModel.mapOptionalNumber(data.id);
    if (id === undefined || id === null) return null;

    const title = typeof data.title === 'string' ? data.title : undefined;
    const name = typeof data.name === 'string' ? data.name : undefined;

    return {
      id,
      title: name || title || `#${id}`,
    };
  }

  static mapOptionalNumber(value: unknown): number | null | undefined {
    if (value === null) return null;
    if (value === undefined || value === '') return undefined;

    const rawValue =
      typeof value === 'object' && value !== null ? (value as Record<string, unknown>).id : value;
    const numberValue = Number(rawValue);

    return Number.isFinite(numberValue) ? numberValue : undefined;
  }

  static fromJson(json: Record<string, unknown>): ProjectPreviewShowModel {
    if (!json) {
      throw new Error('Cannot create ProjectPreviewShowModel from null or undefined');
    }

    const id = ProjectPreviewShowModel.mapOptionalNumber(json.id);
    const project = ProjectPreviewShowModel.mapSelectItem(json.project);
    const engineer = ProjectPreviewShowModel.mapSelectItem(json.engineer);
    const pricingResponsible = ProjectPreviewShowModel.mapSelectItem(json.pricing_responsible);

    return new ProjectPreviewShowModel({
      id: id ?? undefined,
      project_preview_id: id ?? undefined,
      project,
      project_id:
        project?.id ?? ProjectPreviewShowModel.mapOptionalNumber(json.project_id) ?? undefined,
      engineer,
      engineer_id:
        engineer?.id ?? ProjectPreviewShowModel.mapOptionalNumber(json.engineer_id) ?? undefined,
      preview_date: json.preview_date as string | undefined,
      preview_time: json.preview_time as string | undefined,
      site_link: json.site_link as string | null | undefined,
      address: json.address as string | null | undefined,
      status: ProjectPreviewShowModel.mapOptionalNumber(json.status),
      notification_type: ProjectPreviewShowModel.mapOptionalNumber(json.notification_type),
      notification_message: json.notification_message as string | null | undefined,
      pricing_responsible: pricingResponsible,
      pricing_responsible_id:
        pricingResponsible?.id ??
        ProjectPreviewShowModel.mapOptionalNumber(json.pricing_responsible_id) ??
        undefined,
    });
  }

  static example = new ProjectPreviewShowModel({
    id: 1,
    project_preview_id: 1,
    project: {
      id: 10,
      title: 'Commercial project',
    },
    project_id: 10,
    engineer: {
      id: 15,
      title: 'Site engineer',
    },
    engineer_id: 15,
    preview_date: '2026-06-25',
    preview_time: '10:30:00',
    site_link: 'https://maps.google.com/?q=30.0444,31.2357',
    address: 'Nasr City, Cairo, Egypt',
    status: 1,
    notification_type: 2,
    notification_message: 'Preview is ready',
    pricing_responsible: {
      id: 18,
      title: 'Pricing lead',
    },
    pricing_responsible_id: 18,
  });
}
