export interface ProjectFloorItem {
  id: number;
  title: string;
}

export interface ProjectFloorProject extends ProjectFloorItem {
  site_description?: string | null;
  technical_general_notes?: string | null;
  inspection_recommendations?: string | null;
  expected_design_duration?: number | string | null;
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

export default class ProjectFloorShowModel {
  public readonly id?: number;

  public readonly project?: ProjectFloorProject;
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
    project?: ProjectFloorProject;
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

  private static asRecord(value: unknown): Record<string, unknown> | undefined {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }

    return value as Record<string, unknown>;
  }

  private static toOptionalNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const numberValue = Number(value);

    return Number.isFinite(numberValue) ? numberValue : undefined;
  }

  private static toPositiveInteger(value: unknown): number | undefined {
    const numberValue = ProjectFloorShowModel.toOptionalNumber(value);

    return numberValue !== undefined &&
      Number.isInteger(numberValue) &&
      numberValue > 0
      ? numberValue
      : undefined;
  }

  private static toNullableString(value: unknown): string | null {
    if (typeof value === 'string') {
      return value;
    }

    return null;
  }

  private static getTitle(data: Record<string, unknown>, fallbackId: number): string {
    if (typeof data.name === 'string') {
      return data.name;
    }

    if (typeof data.title === 'string') {
      return data.title;
    }

    if (Array.isArray(data.title)) {
      const translations = data.title
        .map((item) => ProjectFloorShowModel.asRecord(item))
        .filter((item): item is Record<string, unknown> => Boolean(item));

      const englishTitle = translations.find((item) => item.locale === 'en')?.title;
      const firstTitle = translations[0]?.title;

      if (typeof englishTitle === 'string') {
        return englishTitle;
      }

      if (typeof firstTitle === 'string') {
        return firstTitle;
      }
    }

    return `#${fallbackId}`;
  }

  private static mapItem(item: unknown): ProjectFloorItem | undefined {
    const data = ProjectFloorShowModel.asRecord(item);

    if (!data) {
      return undefined;
    }

    const id = ProjectFloorShowModel.toPositiveInteger(data.id);

    if (id === undefined) {
      return undefined;
    }

    return {
      id,
      title: ProjectFloorShowModel.getTitle(data, id),
    };
  }

  private static mapProject(item: unknown): ProjectFloorProject | undefined {
    const data = ProjectFloorShowModel.asRecord(item);

    if (!data) {
      return undefined;
    }

    const id = ProjectFloorShowModel.toPositiveInteger(data.id);

    if (id === undefined) {
      return undefined;
    }

    const expectedDesignDuration =
      typeof data.expected_design_duration === 'string' ||
      typeof data.expected_design_duration === 'number'
        ? data.expected_design_duration
        : null;

    return {
      id,
      title: ProjectFloorShowModel.getTitle(data, id),

      site_description: ProjectFloorShowModel.toNullableString(
        data.site_description,
      ),

      technical_general_notes: ProjectFloorShowModel.toNullableString(
        data.technical_general_notes,
      ),

      inspection_recommendations: ProjectFloorShowModel.toNullableString(
        data.inspection_recommendations,
      ),

      expected_design_duration: expectedDesignDuration,
    };
  }

  private static mapAttachments(
    attachments: unknown,
  ): ProjectFloorSpaceAttachment[] {
    if (!Array.isArray(attachments)) {
      return [];
    }

    return attachments.flatMap((attachment) => {
      const data = ProjectFloorShowModel.asRecord(attachment);

      if (!data || typeof data.file !== 'string') {
        return [];
      }

      return [
        {
          id: ProjectFloorShowModel.toPositiveInteger(data.id),

          file: data.file,

          file_size:
            typeof data.file_size === 'string'
              ? data.file_size
              : undefined,

          alt:
            typeof data.alt === 'string' || data.alt === null
              ? data.alt
              : undefined,

          type: ProjectFloorShowModel.toOptionalNumber(data.type),

          link:
            typeof data.link === 'string' || data.link === null
              ? data.link
              : undefined,

          created_at:
            typeof data.created_at === 'string'
              ? data.created_at
              : undefined,
        },
      ];
    });
  }

  private static mapSpaces(spaces: unknown): ProjectFloorSpace[] {
    if (!Array.isArray(spaces)) {
      return [];
    }

    return spaces.flatMap((item) => {
      const data = ProjectFloorShowModel.asRecord(item);

      if (!data) {
        return [];
      }

      const spaceData = ProjectFloorShowModel.asRecord(data.space);

      const spaceId =
        ProjectFloorShowModel.toPositiveInteger(spaceData?.id) ??
        ProjectFloorShowModel.toPositiveInteger(data.space_id);

      if (spaceId === undefined) {
        return [];
      }

      return [
        {
          id: ProjectFloorShowModel.toPositiveInteger(data.id),

          space_id: spaceId,

          space: {
            id: spaceId,

            title: spaceData
              ? ProjectFloorShowModel.getTitle(spaceData, spaceId)
              : typeof data.title === 'string'
                ? data.title
                : `#${spaceId}`,
          },

          length: String(data.length ?? ''),
          width: String(data.width ?? ''),
          height: String(data.height ?? ''),

          notes:
            typeof data.notes === 'string'
              ? data.notes
              : '',

          attachments: ProjectFloorShowModel.mapAttachments(
            data.attachments,
          ),
        },
      ];
    });
  }

  static fromJson(json: Record<string, unknown>): ProjectFloorShowModel {
    if (!json) {
      throw new Error(
        'Cannot create ProjectFloorShowModel from null or undefined',
      );
    }

    const projectData = ProjectFloorShowModel.asRecord(json.project);
    const project = ProjectFloorShowModel.mapProject(json.project);

    const projectId =
      project?.id ??
      ProjectFloorShowModel.toPositiveInteger(json.project_id);

    const previewData = ProjectFloorShowModel.asRecord(
      json.project_preview,
    );

    const previewId =
      ProjectFloorShowModel.toPositiveInteger(previewData?.id) ??
      ProjectFloorShowModel.toPositiveInteger(
        json.project_preview_id,
      );

    const projectPreview: ProjectFloorPreview | undefined =
      previewId === undefined
        ? undefined
        : {
            id: previewId,

            preview_date:
              typeof previewData?.preview_date === 'string'
                ? previewData.preview_date
                : undefined,

            preview_time:
              typeof previewData?.preview_time === 'string'
                ? previewData.preview_time
                : undefined,

            address:
              typeof previewData?.address === 'string' ||
              previewData?.address === null
                ? previewData.address
                : undefined,

            site_link:
              typeof previewData?.site_link === 'string'
                ? previewData.site_link
                : undefined,

            engineer: ProjectFloorShowModel.mapItem(
              previewData?.engineer,
            ),
          };

    const floor = ProjectFloorShowModel.asRecord(json.floor);

    return new ProjectFloorShowModel({
      id: ProjectFloorShowModel.toPositiveInteger(json.id),

      project,
      project_id: projectId,

      project_preview: projectPreview,
      project_preview_id: previewId,

      floor_number:
        ProjectFloorShowModel.toOptionalNumber(
          json.floor_number,
        ) ??
        ProjectFloorShowModel.toOptionalNumber(
          floor?.number,
        ) ??
        ProjectFloorShowModel.toOptionalNumber(
          floor?.floor_number,
        ),

      site_description:
        ProjectFloorShowModel.toNullableString(
          json.site_description,
        ) ??
        ProjectFloorShowModel.toNullableString(
          projectData?.site_description,
        ),

      technical_general_notes:
        ProjectFloorShowModel.toNullableString(
          json.technical_general_notes,
        ) ??
        ProjectFloorShowModel.toNullableString(
          projectData?.technical_general_notes,
        ),

      inspection_recommendations:
        ProjectFloorShowModel.toNullableString(
          json.inspection_recommendations,
        ) ??
        ProjectFloorShowModel.toNullableString(
          projectData?.inspection_recommendations,
        ),

      spaces: ProjectFloorShowModel.mapSpaces(
        json.spaces,
      ),

      attachments: ProjectFloorShowModel.mapAttachments(
        json.attachments,
      ),

      created_at:
        typeof json.created_at === 'string'
          ? json.created_at
          : undefined,
    });
  }

  static example = new ProjectFloorShowModel({
    id: 50,

    project_id: 43,

    project: {
      id: 43,
      title: 'fsddsf',
      site_description: 'Ut aliquam et ration',
      technical_general_notes: 'Commodi amet ipsa',
      inspection_recommendations: 'Velit incididunt qu',
      expected_design_duration: null,
    },

    project_preview_id: 47,

    project_preview: {
      id: 47,
      preview_date: '2026-07-14',
      preview_time: '16:53:00',
      address: 'sfddsf',
      site_link: 'https://chatgpt.com11',
      engineer: {
        id: 4,
        title: 'rawan mamdooh',
      },
    },

    floor_number: 0,

    site_description: 'Ut aliquam et ration',
    technical_general_notes: 'Commodi amet ipsa',
    inspection_recommendations: 'Velit incididunt qu',

    spaces: [
      {
        id: 101,
        space_id: 3,

        space: {
          id: 3,
          title: 'Bed Room',
        },

        length: '2.00',
        width: '63.00',
        height: '43.00',

        notes: 'Adipisci reiciendis',

        attachments: [
          {
            id: 106,
            file:
              'https://api.buildhub.techlabeg.com/attachments/project_floor_spaces/X0E0jcWDjs_1784037164.jpeg',
            file_size: '7.08 KB',
            alt: '9.jfif',
            type: 1,
            link: null,
            created_at: '2026-07-14 13:52:44',
          },
        ],
      },
    ],

    attachments: [],

    created_at: '2026-07-14 13:52:44',
  });
}