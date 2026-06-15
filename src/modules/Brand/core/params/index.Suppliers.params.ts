import IndexParams from '@/base/Core/Params/indexParams';

export default class IndexSuppliersParams extends IndexParams {
  dateRemove: string | null | undefined;
  supplierTypeId: number | null | undefined;
  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    dateRemove?: string | null,
    supplierTypeId?: number | null,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.dateRemove = dateRemove;
    this.supplierTypeId = supplierTypeId;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();
    if (this.dateRemove) {
      data['date_remove'] = this.dateRemove;
    }
    if (this.supplierTypeId) {
      data['supplier_type_id'] = this.supplierTypeId;
    }

    return data;
  }
}
