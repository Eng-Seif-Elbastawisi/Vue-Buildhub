import IndexParams from '@/base/Core/Params/indexParams';
import { ConvertStatus } from '@/modules/MainOrganization/Project/core/constants/convert.status.enum';
import type { DepartmentTypeEnum } from '@/modules/shared/Department/core/constants/Type.enum';

export default class IndexProjectParams extends IndexParams {
  public dateRemove?: string | null;
  public status?: ConvertStatus[] | null;
  public readonly service_type?: DepartmentTypeEnum[];
  public clientId?: number;
  public sortBy?: string;
  public sortDirection?: 'asc' | 'desc';

  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    dateRemove?: string | null,
    status: ConvertStatus[] | null = [ConvertStatus.ACCEPT_CLIENT],
    serviceType?: DepartmentTypeEnum[],
    sortBy?: string,
    sortDirection?: 'asc' | 'desc',
  ) {
    super(word, pageNumber, perPage, withPage);

    this.dateRemove = dateRemove;
    this.status = status;
    this.service_type = serviceType;
    this.sortBy = sortBy;
    this.sortDirection = sortDirection;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();

    if (this.dateRemove) {
      data.date_remove = this.dateRemove;
    }

    if (this.status?.length) {
      data.status = this.status;
    }

    if (Array.isArray(this.service_type) && this.service_type.length > 0) {
      data.service_type = this.service_type;
    }

    if (this.clientId) {
      data.client_id = this.clientId;
    }

    if (this.sortBy) {
      data.sort_by = this.sortBy;
    }

    if (this.sortDirection) {
      data.sort_direction = this.sortDirection;
    }

    return data;
  }
}
