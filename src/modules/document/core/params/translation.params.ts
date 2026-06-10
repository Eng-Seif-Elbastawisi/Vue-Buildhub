import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DocumentTranslationParams implements Params {
  public description: Record<string, string>;
  public title: Record<string, string>;

  public static readonly validation = new ClassValidation().setRules({
    title: { required: true },
    description: { required: true },
  });

  constructor(data: { description: Record<string, string>, title: Record<string, string> }) {
    this.description = data.description;
    this.title = data.title;
  }

  toMap(): { [p: string]: any } {
    return {
      description: this.description,
      title: this.title,
    };
  }

  validate() {
    return DocumentTranslationParams.validation.validate(this);
  }

  validateOrThrow() {
    return DocumentTranslationParams.validation.validateOrThrow(this);
  }
}
