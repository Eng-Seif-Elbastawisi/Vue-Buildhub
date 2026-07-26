import type Params from './params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export type SupportedLang = 'en' | 'ar' | 'fr' | 'es' | 'zh';
export type LocalizedText = Partial<Record<SupportedLang, string>>;

const withBilingualTitleFallback = (title?: LocalizedText): LocalizedText | undefined => {
  if (!title) return undefined;

  const englishTitle = title.en?.trim();
  const arabicTitle = title.ar?.trim();

  if (englishTitle && !arabicTitle) return { ...title, ar: title.en };
  if (arabicTitle && !englishTitle) return { ...title, en: title.ar };

  return title;
};

export default class TranslationParams implements Params {
  public title?: LocalizedText;
  public description?: LocalizedText;

  public static readonly validation = new ClassValidation().setRules({
    title: { required: true },
  });

  constructor(data: { title?: LocalizedText; description?: LocalizedText }) {
    this.title = withBilingualTitleFallback(data.title);
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
