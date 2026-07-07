import IndexParams from '@/base/Core/Params/indexParams';

export default class IndexProjectPricingParams extends IndexParams {
  dateRemove: string | null | undefined;
  // type: ItemTypeEnum | null | undefined;
  projectId: number | null | undefined;
  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    dateRemove?: string | null,
    // type?: ItemTypeEnum | null,
    projectId?: number | null,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.dateRemove = dateRemove;
    // this.type = type;
    this.projectId = projectId;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();
    if (this.dateRemove) {
      data['date_remove'] = this.dateRemove;
    }
    if (this.projectId) {
      data['project_id'] = this.projectId;
    }
    // if (this.type) {
    //   data['type'] = this.type;
    // }

    return data;
  }
}
