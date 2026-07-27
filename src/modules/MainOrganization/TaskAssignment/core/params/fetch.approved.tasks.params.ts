export interface FetchApprovedTasksParamsData {
  page?: number;
  perPage?: number;
  isAssign?: number;
}

export default class FetchApprovedTasksParams {
  public readonly page: number;
  public readonly perPage: number;
  public readonly isAssign: number;

  constructor({ page = 1, perPage = 10, isAssign = 0 }: FetchApprovedTasksParamsData = {}) {
    this.page = page;
    this.perPage = perPage;
    this.isAssign = isAssign;
  }

  public toMap(): Record<string, number> {
    return {
      page: this.page,
      per_page: this.perPage,
      is_assign: this.isAssign,
    };
  }
}
