import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ToggleOrganizationParams implements Params {
  public toggle_status: number;

  public static readonly validation = new ClassValidation().setRules({
    toggle_status: {
      required: true,
      custom: (value) => value === 1 || value === 2 || 'toggle_status must be 1 or 2',
    },
  });

  constructor(data: { toggle_status: number }) {
    this.toggle_status = data.toggle_status;
  }

  toMap(): Record<string, number> {
    return {
      toggle_status: this.toggle_status,
    };
  }

  validate() {
    return ToggleOrganizationParams.validation.validate(this);
  }

  validateOrThrow() {
    return ToggleOrganizationParams.validation.validateOrThrow(this);
  }
}
