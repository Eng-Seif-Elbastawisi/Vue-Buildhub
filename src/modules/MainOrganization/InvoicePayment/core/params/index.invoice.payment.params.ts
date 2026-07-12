import IndexParams from '@/base/Core/Params/indexParams';

export default class IndexInvoicePaymentParams extends IndexParams {
  public invoiceId?: number | null;

  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    invoiceId?: number | null,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.invoiceId = invoiceId;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();

    if (this.invoiceId) {
      data.invoice_id = this.invoiceId;
    }

    return data;
  }
}
