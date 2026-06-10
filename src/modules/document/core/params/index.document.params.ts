import IndexParams from '@/base/Core/Params/indexParams';

export default class IndexDocumentParams extends IndexParams {
  dateRemove: string | null | undefined;
  documentTypeId: number | null | undefined;
  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    dateRemove?: string | null,
    documentTypeId?: number | null,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.dateRemove = dateRemove;
    this.documentTypeId = documentTypeId;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();
    if (this.dateRemove) {
      data['date_remove'] = this.dateRemove;
    }
    if (this.documentTypeId) {
      data['document_type_id'] = this.documentTypeId;
    }

    return data;
  }
}
