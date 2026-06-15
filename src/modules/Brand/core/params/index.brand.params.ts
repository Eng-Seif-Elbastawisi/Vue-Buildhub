import IndexParams from '@/base/Core/Params/indexParams';
import { EquipmentTypeEnum } from '../constant/equipment.type.enum';

export default class IndexBrandParams extends IndexParams {
  dateRemove: string | null | undefined;
  equipmentType: EquipmentTypeEnum | null | undefined;
  constructor(
    word: string = '',
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
    dateRemove?: string | null,
    equipmentType?: EquipmentTypeEnum | null,
  ) {
    super(word, pageNumber, perPage, withPage);
    this.dateRemove = dateRemove;
    this.equipmentType = equipmentType;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data = super.toMap();
    if (this.dateRemove) {
      data['date_remove'] = this.dateRemove;
    }
    if (this.equipmentType) {
      data['equipment_type'] = this.equipmentType;
    }

    return data;
  }
}
