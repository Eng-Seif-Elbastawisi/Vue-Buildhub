import IndexParams from '@/base/Core/Params/indexParams';

export default class IndexProjectPreviewParams extends IndexParams {
  public dateRemove?: string | null;
  public projectId?: number;
  public projectPreviewId?: number;

  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    dateRemove?: string | null,
    projectId?: number,
    projectPreviewId?: number,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.dateRemove = dateRemove;
    this.projectId = projectId;
    this.projectPreviewId = projectPreviewId;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();

    if (this.dateRemove) {
      data.date_remove = this.dateRemove;
    }

    if (this.projectId) {
      data.project_id = this.projectId;
    }

    if (this.projectPreviewId) {
      data.project_preview_id = this.projectPreviewId;
    }

    return data;
  }
}
