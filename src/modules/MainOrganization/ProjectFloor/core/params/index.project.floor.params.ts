import IndexParams from '@/base/Core/Params/indexParams';

export default class IndexProjectFloorParams extends IndexParams {
  public dateRemove?: string | null;
  public projectId?: number | null;

  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    dateRemove?: string | null,
    projectId?: number | null,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.dateRemove = dateRemove;
    this.projectId = projectId;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();
    if (this.dateRemove) data.date_remove = this.dateRemove;
    if (this.projectId) data.project_id = this.projectId;
    return data;
  }
}
