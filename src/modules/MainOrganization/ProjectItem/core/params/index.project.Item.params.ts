import IndexParams from '@/base/Core/Params/indexParams';

export default class IndexProjectItemParams extends IndexParams {
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
    projectId: number = 0,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.dateRemove = dateRemove;
    this.projectId = projectId;
    // this.type = type;
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
