import { ConvertStatus } from '../constants/convert.status.enum';

export interface ProjectHistoryClient {
  id?: number;
  title?: string;
}

export interface ProjectHistoryProject {
  id?: number;
  client?: ProjectHistoryClient | null;
  title?: string;
  description?: string;
  date?: string;
  created_at?: string;
}

export interface ProjectHistoryEntry {
  id?: number;
  status?: ConvertStatus | number;
  created_at?: string;
}

export default class ProjectHistoryModel {
  public readonly project: ProjectHistoryProject | null;
  public readonly histories: ProjectHistoryEntry[];

  constructor(data: { project?: ProjectHistoryProject | null; histories?: ProjectHistoryEntry[] }) {
    this.project = data.project ?? null;
    this.histories = data.histories ?? [];

    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ProjectHistoryModel {
    if (!json) {
      throw new Error('Cannot create ProjectHistoryModel from null or undefined');
    }

    const project = json.project as Record<string, unknown> | null | undefined;
    const histories = Array.isArray(json.histories) ? json.histories : [];

    return new ProjectHistoryModel({
      project: project
        ? {
            id: project.id as number | undefined,
            client: project.client as ProjectHistoryClient | null | undefined,
            title: project.title as string | undefined,
            description: project.description as string | undefined,
            date: project.date as string | undefined,
            created_at: project.created_at as string | undefined,
          }
        : null,
      histories: histories.map((history) => {
        const item = history as Record<string, unknown>;

        return {
          id: item.id as number | undefined,
          status: item.status as ConvertStatus | number | undefined,
          created_at: item.created_at as string | undefined,
        };
      }),
    });
  }

  static example = new ProjectHistoryModel({
    project: {
      id: 27,
      client: {
        id: 5,
        title: 'you',
      },
      title: 'Sample Project',
      description: 'Sample project description',
      date: '2026-07-12',
      created_at: '2026-07-12 08:37:09',
    },
    histories: [
      {
        id: 14,
        status: ConvertStatus.REVISE_VERSION,
        created_at: '2026-07-12 09:49:51',
      },
    ],
  });
}
