import IndexParams from '@/base/Core/Params/indexParams';
import type { ItemServiceTypeEnum } from '../constant/item.service.type.enum';

export default class IndexItemParams extends IndexParams {
  dateRemove: string | null | undefined;
  serviceType: ItemServiceTypeEnum | null | undefined;

  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    dateRemove?: string | null,
    serviceType?: ItemServiceTypeEnum | null,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.dateRemove = dateRemove;
    this.serviceType = serviceType;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();
    if (this.dateRemove) {
      data['date_remove'] = this.dateRemove;
    }
    if (this.serviceType) {
      data['service_type'] = this.serviceType;
    }

    return data;
  }
}
