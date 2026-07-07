import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { ProjectItemPriceEnum } from '../constant/project.item.Price.enum';

export interface ProjectItemPayload {
  item_id?: number;
  price?: number;
  quantity?: number;
  pricing_method?: ProjectItemPriceEnum;
  project_floor_id?: number;
  project_floor_space_id?: number;
}

export default class AddProjectItemParams implements Params {
  public project_id: number = 0;
  public department_id?: number;
  public items: ProjectItemPayload[] = [];

  public static readonly validation = new ClassValidation().setRules({
    project_id: { required: true },
    department_id: { required: true },
    items: { required: true },
  });

  constructor(data: { project_id?: number; department_id?: number; items?: ProjectItemPayload[] }) {
    this.project_id = data.project_id ?? 0;
    this.department_id = data.department_id;
    this.items = data.items ?? [];
  }

  toMap(): Record<string, unknown> {
    return {
      project_id: this.project_id,
      department_id: this.department_id,
      items: this.items.map((item) => {
        const map: Record<string, unknown> = {
          item_id: item.item_id,
          quantity: item.quantity,
          pricing_method: item.pricing_method,
        };

        if (item.pricing_method === ProjectItemPriceEnum.GENERAL_ITEM) {
          map.price = item.price;
        }

        if (item.pricing_method === ProjectItemPriceEnum.SPACE_RELATED) {
          map.project_floor_space_id = item.project_floor_space_id;
        }

        if (item.pricing_method === ProjectItemPriceEnum.FULL_FLOOR_RELATED) {
          map.price = item.price;
          map.project_floor_id = item.project_floor_id;
        }

        return map;
      }),
    };
  }

  validate() {
    return AddProjectItemParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddProjectItemParams.validation.validateOrThrow(this);
  }
}
