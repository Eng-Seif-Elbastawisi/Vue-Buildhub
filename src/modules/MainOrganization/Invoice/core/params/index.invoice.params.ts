import IndexParams from '@/base/Core/Params/indexParams';
import type { InvoiceStatusEnum } from '../constant/invoice.status.enum';

export default class IndexInvoiceParams extends IndexParams {
  public projectId?: number | null;
  public status?: InvoiceStatusEnum | null;
  public export_status?: number | null;

  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    projectId?: number | null,
    status?: InvoiceStatusEnum | null,
    exportStatus?: number | null,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.projectId = projectId;
    this.status = status;
    this.export_status = exportStatus;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();

    if (this.projectId) {
      data.project_id = this.projectId;
    }

    if (this.status) {
      data.invoice_status = this.status;
    }

    if (this.export_status !== undefined && this.export_status !== null) {
      data.export_status = this.export_status;
    }

    return data;
  }
}
