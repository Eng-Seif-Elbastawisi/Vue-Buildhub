import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class EditProjectPreviewParams implements Params {
  public id?: number;
  public engineer_id?: number;
  public preview_date?: string;
  public preview_time?: string;
  public site_link?: string;
  public address?: string;

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: {
    id?: number;
    engineer_id?: number;
    preview_date?: string;
    preview_time?: string;
    site_link?: string;
    address?: string;
  }) {
    this.id = data.id;
    this.engineer_id = data.engineer_id;
    this.preview_date = data.preview_date;
    this.preview_time = data.preview_time;
    this.site_link = data.site_link;
    this.address = data.address;
  }

  toMap(): Record<string, unknown> {
    return {
      id: this.id,
      engineer_id: this.engineer_id,
      preview_date: this.preview_date,
      preview_time: this.preview_time,
      site_link: this.site_link,
      address: this.address,
    };
  }

  validate() {
    return EditProjectPreviewParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditProjectPreviewParams.validation.validateOrThrow(this);
  }
}
