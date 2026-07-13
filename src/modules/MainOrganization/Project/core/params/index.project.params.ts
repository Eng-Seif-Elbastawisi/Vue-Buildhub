import IndexParams from '@/base/Core/Params/indexParams';
import { ConvertStatus } from '@/modules/MainOrganization/Project/core/constants/convert.status.enum';

export default class IndexProjectParams extends IndexParams {
  public dateRemove?: string | null;
  public status?: ConvertStatus | null;

  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    dateRemove?: string | null,
    status: ConvertStatus | null = ConvertStatus.PENDING,
  ) {
    super(word, pageNumber, perPage, withPage);

    this.dateRemove = dateRemove;
    this.status = status;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();

    if (this.dateRemove) {
      data.date_remove = this.dateRemove;
    }

    if (this.status !== null && this.status !== undefined) {
      data.status = this.status;
    }

    return data;
  }
}
