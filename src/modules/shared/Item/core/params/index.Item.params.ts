import IndexParams from '@/base/Core/Params/indexParams';
import type { ItemServiceTypeEnum } from '../constant/item.service.type.enum';
import type { DepartmentTypeEnum } from '@/modules/shared/Department/core/constants/Type.enum';

export default class IndexItemParams extends IndexParams {
  dateRemove: string | null | undefined;
  serviceType: ItemServiceTypeEnum | null | undefined;
  departmentId: DepartmentTypeEnum | null | undefined;

  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    dateRemove?: string | null,
    serviceType?: ItemServiceTypeEnum | null,
    departmentId?: DepartmentTypeEnum | null,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.dateRemove = dateRemove;
    this.serviceType = serviceType;
    this.departmentId = departmentId;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();
    if (this.dateRemove) {
      data['date_remove'] = this.dateRemove;
    }
    if (this.serviceType) {
      data['service_type'] = this.serviceType;
    }
    if (this.departmentId) {
      data['type'] = this.departmentId;
    }

    return data;
  }
}
