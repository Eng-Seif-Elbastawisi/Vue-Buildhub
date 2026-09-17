import IndexParams from '@/base/Core/Params/indexParams';

type IndexStageParamsData = {
  word?: string;
  page?: number;
  perPage?: number;
  withPage?: number;
  parentId?: number | null;
};

export default class IndexStageParams extends IndexParams {
  public parentId?: number | null;

  constructor(data?: IndexStageParamsData);
  constructor(word?: string, pageNumber?: number, perPage?: number, withPage?: number ,parentId?: number | null);

  constructor(
    dataOrWord: IndexStageParamsData | string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    parentId?: number | null,
  ) {
    if (typeof dataOrWord === 'object') {
      super(
        dataOrWord.word ?? '',
        dataOrWord.page ?? 1,
        dataOrWord.perPage ?? 10,
        dataOrWord.withPage ?? 1,
      );

      this.parentId = dataOrWord.parentId;
      return;
    }

    super(dataOrWord, pageNumber, perPage, withPage);
    this.parentId = parentId;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();

    if (this.parentId !== undefined) {
      data.parent_id = this.parentId;
    }

    return data;
  }
}
