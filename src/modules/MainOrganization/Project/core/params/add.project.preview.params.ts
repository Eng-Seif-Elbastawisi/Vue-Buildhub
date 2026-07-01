import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { type NotificationType } from '../constants/notificationType.enum';
import { type Status } from '../constants/status.enum';

export default class AddProjectPreviewParams implements Params {
  public engineer_id?: number;
  public preview_date?: string;
  public preview_time?: string;
  public site_link?: string;
  public address?: string;
  public project_id?: number;
  public notification_type?: NotificationType;
  public status?: Status;
  public pricing_responsible_id?: number;
  public notification_message?: string;

  public static readonly validation = new ClassValidation().setRules({
    engineer_id: { required: true },
    preview_date: { required: true },
    preview_time: { required: true },
    project_id: { required: true },

    // خلي دول required بس لو الفورم بيبعتهم فعلاً
    // notification_type: { required: true },
    // status: { required: true },
    // pricing_responsible_id: { required: true },
    // notification_message: { required: true },
  });

  constructor(data: {
    engineer_id?: number;
    preview_date?: string;
    preview_time?: string;
    site_link?: string;
    address?: string;
    project_id?: number;
    notification_type?: NotificationType;
    status?: Status;
    pricing_responsible_id?: number;
    notification_message?: string;
  }) {
    this.engineer_id = data.engineer_id;
    this.preview_date = data.preview_date;
    this.preview_time = data.preview_time;
    this.site_link = data.site_link;
    this.address = data.address;
    this.project_id = data.project_id;
    this.notification_type = data.notification_type;
    this.status = data.status;
    this.pricing_responsible_id = data.pricing_responsible_id;
    this.notification_message = data.notification_message;
  }

  toMap(): Record<string, unknown> {
    return {
      engineer_id: this.engineer_id,
      preview_date: this.preview_date,
      preview_time: this.preview_time,
      site_link: this.site_link,
      address: this.address,
      project_id: this.project_id,
      notification_type: this.notification_type,
      status: this.status,
      pricing_responsible_id: this.pricing_responsible_id,
      notification_message: this.notification_message,
    };
  }

  validate() {
    return AddProjectPreviewParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddProjectPreviewParams.validation.validateOrThrow(this);
  }
}