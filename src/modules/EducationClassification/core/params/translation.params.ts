import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for adding a new country
 */
export default class TranslationParams implements Params {
  SingularTitle: Record<string, string>;
  PluralTitle: Record<string, string>;

  public static readonly validation = new ClassValidation().setRules({
    translation: { required: true },
  });

  constructor(data: {
    SingularTitle: Record<string, string>;
    PluralTitle: Record<string, string>;
  }) {
    this.SingularTitle = data.SingularTitle;
    this.PluralTitle = data.PluralTitle;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      singular_title: this.SingularTitle,
      plural_title: this.PluralTitle,
    };
    return map;
  }

  validate() {
    return TranslationParams.validation.validate(this);
  }

  validateOrThrow() {
    return TranslationParams.validation.validateOrThrow(this);
  }
}
