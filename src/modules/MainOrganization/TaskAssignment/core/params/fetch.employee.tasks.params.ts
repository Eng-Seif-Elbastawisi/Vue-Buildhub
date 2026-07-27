import IndexParams from '@/base/Core/Params/indexParams';

const normalizePositiveId = (value: unknown): number | undefined => {
  const numberValue = Number(value);

  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : undefined;
};

export default class FetchEmployeeTasksParams extends IndexParams {
  public readonly projectId?: number;
  public readonly employeeId?: number;

  constructor(data: {
    projectId?: number;
    employeeId?: number;
    pageNumber?: number;
    perPage?: number;
    withPage?: number;
  }) {
    super('', data.pageNumber ?? 1, data.perPage ?? 10, data.withPage ?? 1);
    this.projectId = normalizePositiveId(data.projectId);
    this.employeeId = normalizePositiveId(data.employeeId);
  }

  toMap(): Record<string, string | number | number[] | null> {
    return {
      ...super.toMap(),
      ...(this.projectId ? { project_id: this.projectId } : {}),
      ...(this.employeeId ? { employee_id: this.employeeId } : {}),
    };
  }
}
