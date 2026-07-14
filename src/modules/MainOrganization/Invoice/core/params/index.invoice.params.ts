import IndexParams from '@/base/Core/Params/indexParams';
import type { InvoiceStatusEnum } from '../constant/invoice.status.enum';

export default class IndexInvoiceParams extends IndexParams {
  public projectId?: number | null;
  public status?: InvoiceStatusEnum | null;

  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    projectId?: number | null,
    status?: InvoiceStatusEnum | null,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.projectId = projectId;
    this.status = status;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();

    if (this.projectId) {
      data.project_id = this.projectId;
    }

    if (this.status) {
      data.invoice_status = this.status;
    }

    return data;
  }
}
