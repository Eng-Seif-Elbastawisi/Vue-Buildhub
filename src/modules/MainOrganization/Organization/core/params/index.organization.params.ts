import IndexParams from '@/base/Core/Params/indexParams';

export default class IndexOrganizationParams extends IndexParams {
  dateRemove: string | null | undefined;
  organizationTypeId: number | null | undefined;
  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    dateRemove?: string | null,
    organizationTypeId?: number | null,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.dateRemove = dateRemove;
    this.organizationTypeId = organizationTypeId;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();
    if (this.dateRemove) {
      data['date_remove'] = this.dateRemove;
    }
    if (this.organizationTypeId) {
      data['organization_type_id'] = this.organizationTypeId;
    }

    return data;
  }
}
