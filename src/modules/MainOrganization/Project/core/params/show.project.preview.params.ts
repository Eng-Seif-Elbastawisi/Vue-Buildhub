import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowProjectPreviewParams implements Params {
  public previewId: number;
  public allLocales: boolean | undefined;
  public static readonly validation = new ClassValidation().setRules({
    previewId: { required: true },
  });

  constructor(data: { previewId: number; allLocales?: boolean }) {
    this.previewId = data.previewId;
    this.allLocales = data.allLocales;
  }
  toMap(): Record<string, number | boolean> {
    const map: Record<string, number | boolean> = { preview_id: this.previewId };
    if (this.allLocales) map.allLocales = this.allLocales;
    return map;
  }
  validate() {  
    return ShowProjectPreviewParams.validation.validate(this);
  }
  validateOrThrow() {
    return ShowProjectPreviewParams.validation.validateOrThrow(this);
  }
}
