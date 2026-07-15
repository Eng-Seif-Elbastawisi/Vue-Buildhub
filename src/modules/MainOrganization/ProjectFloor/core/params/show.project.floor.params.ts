import type Params from '@/base/Core/Params/params';
import { translate } from '@/locales/i18n';
import { ValidationError, type FieldError } from '@/base/Presentation/Utils/classValidation';

export default class ShowProjectFloorParams implements Params {
  public project_floor_id?: number;
  public project_id?: number;
  public project_preview_id?: number;
  public allLocales?: boolean;

  constructor(data: {
    project_floor_id?: number;
    project_id?: number;
    project_preview_id?: number;
    allLocales?: boolean;
  }) {
    this.project_floor_id = data.project_floor_id;
    this.project_id = data.project_id;
    this.project_preview_id = data.project_preview_id;
    this.allLocales = data.allLocales;
  }

  toMap(): Record<string, number | boolean> {
    const map: Record<string, number | boolean> = {};

    if (this.isPositiveInteger(this.project_floor_id)) {
      map.project_floor_id = this.project_floor_id;
    }

    if (this.isPositiveInteger(this.project_id)) {
      map.project_id = this.project_id;
    }

    if (this.isPositiveInteger(this.project_preview_id)) {
      map.project_preview_id = this.project_preview_id;
    }

    if (this.allLocales !== undefined) {
      map.allLocales = this.allLocales;
    }

    return map;
  }

  validate(): { isValid: boolean; errors: FieldError[] } {
    if (this.isPositiveInteger(this.project_floor_id) || this.isPositiveInteger(this.project_id)) {
      return { isValid: true, errors: [] };
    }

    return {
      isValid: false,
      errors: [
        {
          field: 'project_floor_id',
          message: translate('validation.required', { field: 'project_floor_id' }),
        },
      ],
    };
  }

  validateOrThrow() {
    const validation = this.validate();

    if (!validation.isValid) {
      new ValidationError(validation.errors).openDialog();
    }
  }

  private isPositiveInteger(value?: number): value is number {
    return Number.isInteger(value) && Number(value) > 0;
  }
}
