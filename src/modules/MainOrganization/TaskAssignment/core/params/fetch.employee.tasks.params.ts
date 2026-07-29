import IndexParams from '@/base/Core/Params/indexParams';
import type { InsideStatusType } from '../constants/inside.status.enum';

const normalizePositiveId = (value: unknown): number | undefined => {
  const numberValue = Number(value);

  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : undefined;
};

export default class FetchEmployeeTasksParams extends IndexParams {
  public readonly projectId?: number;
  public readonly employeeId?: number;
  public readonly status?: InsideStatusType;

  constructor(data: {
    projectId?: number;
    employeeId?: number;
    pageNumber?: number;
    perPage?: number;
    withPage?: number;
    status?: InsideStatusType;
  }) {
    super('', data.pageNumber ?? 1, data.perPage ?? 10, data.withPage ?? 1);
    this.projectId = normalizePositiveId(data.projectId);
    this.employeeId = normalizePositiveId(data.employeeId);
    this.status = data.status; 
  }

  toMap(): Record<string, string | number | number[] | null> {
    return {
      ...super.toMap(),
      ...(this.projectId ? { project_id: this.projectId } : {}),
      ...(this.employeeId ? { employee_id: this.employeeId } : {}),
      ...(this.status !== undefined
        ? { inside_status: this.status }
        : {}),    };
  }
}
