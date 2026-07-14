import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import { type Status } from '../constants/status.enum';
import { type NotificationType } from '../constants/notificationType.enum';

export default class AddFinalProjectFloorResultParams implements Params {
  public project_preview_id: number;
  public status: Status;
  public pricing_responsible_id: number;
  public notification_type: NotificationType;
  public notification_message: string;

  public static readonly validation = new ClassValidation().setRules({
    project_preview_id: { required: true },
    status: requiredSelectRule(),
    pricing_responsible_id: requiredSelectRule(),
    notification_type: requiredSelectRule(),
    notification_message: { required: true },
  });

  constructor(data: {
    project_preview_id: number;
    status: Status;
    pricing_responsible_id: number;
    notification_type: NotificationType;
    notification_message: string;
  }) {
    this.project_preview_id = data.project_preview_id;
    this.status = data.status;
    this.pricing_responsible_id = data.pricing_responsible_id;
    this.notification_type = data.notification_type;
    this.notification_message = data.notification_message;
  }

  toMap(): Record<string, unknown> {
    return {
      project_preview_id: this.project_preview_id,
      status: this.status,
      pricing_responsible_id: this.pricing_responsible_id,
      notification_type: this.notification_type,
      notification_message: this.notification_message,
    };
  }

  validate() {
    return AddFinalProjectFloorResultParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddFinalProjectFloorResultParams.validation.validateOrThrow(this);
  }
}
