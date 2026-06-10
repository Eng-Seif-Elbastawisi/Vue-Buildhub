import IndexParams from '@/base/Core/Params/indexParams';

export default class IndexPackagesParams extends IndexParams {
  constructor(data: { word: string; pageNumber: number; perPage: number; withPage: number }) {
    super(data.word, data.pageNumber, data.perPage, data.withPage);
  }

  toMap(): Record<string, any> {
    return {
      ...super.toMap(),
    };
  }
}
