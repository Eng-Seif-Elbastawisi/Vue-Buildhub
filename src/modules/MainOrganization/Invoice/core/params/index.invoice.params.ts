import IndexParams from '@/base/Core/Params/indexParams';

export default class IndexInvoiceParams extends IndexParams {
  public projectId?: number | null;

  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    projectId?: number | null,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.projectId = projectId;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();

    if (this.projectId) {
      data.project_id = this.projectId;
    }

    return data;
  }
}
