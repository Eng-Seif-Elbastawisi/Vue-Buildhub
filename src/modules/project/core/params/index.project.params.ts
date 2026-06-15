import IndexParams from '@/base/Core/Params/indexParams';
import type { ProjectTypeEnum } from '../constant/project.type.enum';

export default class IndexProjectParams extends IndexParams {
  public dateRemove?: string | null;
  public projectType?: ProjectTypeEnum | null;

  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    dateRemove?: string | null,
    projectType?: ProjectTypeEnum | null,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.dateRemove = dateRemove;
    this.projectType = projectType;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();
    if (this.dateRemove) data.date_remove = this.dateRemove;
    if (this.projectType) data.project_type = this.projectType;
    return data;
  }
}
