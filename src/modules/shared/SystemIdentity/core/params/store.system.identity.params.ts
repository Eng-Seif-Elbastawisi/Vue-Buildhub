import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class StoreSystemIdentityParams implements Params {
  public name: string;
  public logo?: string;
  public primary_color: string;
  public secondary_color: string;
  public accent_color: string;
  public extracted_colors: string[];
  public is_active: boolean;

  public static readonly validation = new ClassValidation().setRules({
    name: { required: true },
    primary_color: { required: true },
    secondary_color: { required: true },
    accent_color: { required: true },
  });

  constructor(data: {
    name: string;
    logo?: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    extracted_colors?: string[];
    is_active?: boolean;
  }) {
    this.name = data.name;
    this.logo = data.logo;
    this.primary_color = data.primary_color;
    this.secondary_color = data.secondary_color;
    this.accent_color = data.accent_color;
    this.extracted_colors = data.extracted_colors ?? [];
    this.is_active = data.is_active ?? true;
  }

  toMap(): Record<string, unknown> {
    const data: Record<string, unknown> = {
      name: this.name,
      primary_color: this.primary_color,
      secondary_color: this.secondary_color,
      accent_color: this.accent_color,
      extracted_colors: this.extracted_colors,
      is_active: this.is_active,
    };

    if (this.logo) data.logo = this.logo;

    return data;
  }

  validate() {
    return StoreSystemIdentityParams.validation.validate(this);
  }

  validateOrThrow() {
    return StoreSystemIdentityParams.validation.validateOrThrow(this);
  }
}
