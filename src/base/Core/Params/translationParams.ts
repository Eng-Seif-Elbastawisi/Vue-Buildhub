import type Params from './params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export type SupportedLang = 'en' | 'ar' | 'fr' | 'es' | 'zh';
export type LocalizedText = Partial<Record<SupportedLang, string>>;

export default class TranslationParams implements Params {
  public title?: LocalizedText;
  public description?: LocalizedText;

  public static readonly validation = new ClassValidation().setRules({
    title: { required: true },
  });

  constructor(data: { title?: LocalizedText; description?: LocalizedText }) {
    this.title = data.title;
    this.description = data.description;
  }

  toMap(): Record<string, LocalizedText> {
    const data: Record<string, LocalizedText> = {};

    if (this.title) data['title'] = this.title;
    if (this.description) data['description'] = this.description;

    return data;
  }

  validate() {
    return TranslationParams.validation.validate(this);
  }

  validateOrThrow() {
    return TranslationParams.validation.validateOrThrow(this);
  }
}
