export interface ProjectFloorItem {
  id: number;
  title: string;
}

export interface ProjectFloorSpaceAttachment {
  id?: number;
  file: string;
  file_size?: string;
  alt?: string | null;
  type?: number;
  link?: string | null;
  created_at?: string;
}

export interface ProjectFloorSpace {
  id?: number;
  space_id?: number;
  space: ProjectFloorItem;
  length: string;
  width: string;
  height: string;
  notes: string;
  attachments: ProjectFloorSpaceAttachment[];
}

export interface ProjectFloorPreview {
  id: number;
  preview_date?: string;
  preview_time?: string;
  address?: string | null;
  site_link?: string;
  engineer?: ProjectFloorItem;
}

export default class ProjectFloorModel {
  public readonly id?: number;

  public readonly project?: ProjectFloorItem;
  public readonly project_id?: number;

  public readonly project_preview?: ProjectFloorPreview;
  public readonly project_preview_id?: number;

  public readonly floor_number?: number;

  public readonly site_description?: string | null;
  public readonly technical_general_notes?: string | null;
  public readonly inspection_recommendations?: string | null;

  public readonly spaces: ProjectFloorSpace[];
  public readonly attachments: ProjectFloorSpaceAttachment[];

  public readonly created_at?: string;

  constructor(data: {
    id?: number;

    project?: ProjectFloorItem;
    project_id?: number;

    project_preview?: ProjectFloorPreview;
    project_preview_id?: number;

    floor_number?: number;

    site_description?: string | null;
    technical_general_notes?: string | null;
    inspection_recommendations?: string | null;

    spaces?: ProjectFloorSpace[];
    attachments?: ProjectFloorSpaceAttachment[];

    created_at?: string;
  }) {
    this.id = data.id;

    this.project = data.project;
    this.project_id = data.project_id;

    this.project_preview = data.project_preview;
    this.project_preview_id = data.project_preview_id;

    this.floor_number = data.floor_number;

    this.site_description = data.site_description;
    this.technical_general_notes = data.technical_general_notes;
    this.inspection_recommendations = data.inspection_recommendations;

    this.spaces = data.spaces ?? [];
    this.attachments = data.attachments ?? [];

    this.created_at = data.created_at;

    Object.freeze(this);
  }

  private static mapItem(item: any): ProjectFloorItem | undefined {
    if (!item) return undefined;

    return {
      id: Number(item.id),
      title: item.title ?? item.name ?? `#${item.id}`,
    };
  }

  private static mapAttachments(attachments: any): ProjectFloorSpaceAttachment[] {
    if (!Array.isArray(attachments)) return [];

    return attachments.map((attachment: any) => ({
      id: attachment.id,
      file: attachment.file,
      file_size: attachment.file_size,
      alt: attachment.alt,
      type: attachment.type,
      link: attachment.link,
      created_at: attachment.created_at,
    }));
  }

  private static mapSpaces(spaces: any): ProjectFloorSpace[] {
    if (!Array.isArray(spaces)) return [];

    return spaces.map((item: any) => ({
      id: item.id,
      space_id: item.space?.id ?? item.space_id,
      space: {
        id: Number(item.space?.id ?? item.space_id),
        title:
          item.space?.title ??
          item.space?.name ??
          item.title ??
          `#${item.space?.id ?? item.space_id}`,
      },
      length: String(item.length ?? ''),
      width: String(item.width ?? ''),
      height: String(item.height ?? ''),
      notes: item.notes ?? '',
      attachments: ProjectFloorModel.mapAttachments(item.attachments),
    }));
  }

  static fromJson(json: Record<string, any>): ProjectFloorModel {
    if (!json) {
      throw new Error('Cannot create ProjectFloorModel from null or undefined');
    }

    const project = ProjectFloorModel.mapItem(json.project);

    const projectPreview: ProjectFloorPreview | undefined = json.project_preview
      ? {
          id: Number(json.project_preview.id),
          preview_date: json.project_preview.preview_date,
          preview_time: json.project_preview.preview_time,
          address: json.project_preview.address,
          site_link: json.project_preview.site_link,
          engineer: ProjectFloorModel.mapItem(json.project_preview.engineer),
        }
      : undefined;

    return new ProjectFloorModel({
      id: json.id,

      project,
      project_id: project?.id,

      project_preview: projectPreview,
      project_preview_id: projectPreview?.id,

      floor_number: json.floor_number,

      site_description:
        json.site_description ?? json.project_preview?.project?.site_description ?? null,

      technical_general_notes:
        json.technical_general_notes ??
        json.project_preview?.project?.technical_general_notes ??
        null,

      inspection_recommendations:
        json.inspection_recommendations ??
        json.project_preview?.project?.inspection_recommendations ??
        null,

      spaces: ProjectFloorModel.mapSpaces(json.spaces),
      attachments: ProjectFloorModel.mapAttachments(json.attachments),

      created_at: json.created_at,
    });
  }

  static example = new ProjectFloorModel({
    id: 1,

    project_id: 13,
    project: {
      id: 13,
      title: 'Project',
    },

    project_preview_id: 6,
    project_preview: {
      id: 6,
      preview_date: '2026-07-01',
      preview_time: '22:50:00',
      address: 'Nasr City',
      site_link: 'https://maps.google.com',
      engineer: {
        id: 4,
        title: 'Ahmed',
      },
    },

    floor_number: -1,

    site_description: 'Perferendis incidunt',
    technical_general_notes: 'Ad eiusmod qui numqu',
    inspection_recommendations: 'Amet atque culpa e',

    spaces: [
      {
        id: 1,
        space_id: 1,
        space: {
          id: 1,
          title: 'gggggggggg',
        },
        length: '48.00',
        width: '45.00',
        height: '0.00',
        notes: 'Quis ut voluptate te',
        attachments: [],
      },
    ],

    attachments: [],
    created_at: '2026-07-01 07:52:01',
  });
}
