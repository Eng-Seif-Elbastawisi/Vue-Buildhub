import type Params from '@/base/Core/Params/params';
import {
  ClassValidation,
  type FieldError,
  ValidationError,
} from '@/base/Presentation/Utils/classValidation';
import { hasSelectValue, requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';
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
    department_id: requiredSelectRule(),
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

  private getItemSelectErrors(): FieldError[] {
    const errors: FieldError[] = [];

    this.items.forEach((item, index) => {
      const fieldPrefix = `items.${index}`;

      if (!hasSelectValue(item.item_id)) {
        errors.push({
          field: `${fieldPrefix}.item_id`,
          message: translate('validation.select_required'),
        });
      }

      if (!hasSelectValue(item.pricing_method)) {
        errors.push({
          field: `${fieldPrefix}.pricing_method`,
          message: translate('validation.select_required'),
        });
      }

      if (
        item.pricing_method === ProjectItemPriceEnum.SPACE_RELATED &&
        !hasSelectValue(item.project_floor_space_id)
      ) {
        errors.push({
          field: `${fieldPrefix}.project_floor_space_id`,
          message: translate('validation.select_required'),
        });
      }

      if (
        item.pricing_method === ProjectItemPriceEnum.FULL_FLOOR_RELATED &&
        !hasSelectValue(item.project_floor_id)
      ) {
        errors.push({
          field: `${fieldPrefix}.project_floor_id`,
          message: translate('validation.select_required'),
        });
      }
    });

    return errors;
  }

  validate() {
    const validation = AddProjectItemParams.validation.validate(this);
    const errors = [...validation.errors, ...this.getItemSelectErrors()];

    return { isValid: errors.length === 0, errors };
  }

  validateOrThrow() {
    const validation = this.validate();

    if (!validation.isValid) {
      const validationError = new ValidationError(validation.errors);
      validationError.openDialog();
    }
  }
}
