import type Params from "./params";
import { ClassValidation } from "@/base/Presentation/Utils/classValidation";

export type SupportedLang = "en" | "ar" | "fr" | "es" | "zh";
export type LocalizedText = Partial<Record<SupportedLang, string>>;

export default class TranslationParams implements Params {
  public title: LocalizedText;

  public static readonly validation = new ClassValidation().setRules({
    title: { required: true },
  });

  constructor(data:{
    title: LocalizedText
  }) {
    this.title = data.title;
  }

  toMap(): Record<string, LocalizedText> {
    const data: Record<string, LocalizedText> = {};
    if (this.title) data["title"] = this.title;
    return data;
  }

  validate() {
    return TranslationParams.validation.validate(this);
  }

  validateOrThrow() {
    return TranslationParams.validation.validateOrThrow(this);
  }
}
