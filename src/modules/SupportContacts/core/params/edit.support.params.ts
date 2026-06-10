import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/modules/about/core/params/translation.params';

/**
 * Parameters for editing an employee
 */
export default class EditSupportContactsParams implements Params {
  public readonly translation: TranslationParams;
  public readonly phonenumbers: string[];
  public readonly whatsAppNumebrs: string[];
  public readonly emails: string[];
  public readonly telegramNumbers: string[];

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
    translation: { required: true },
  });

  constructor(data: {
    translation: TranslationParams;
    phonenumbers: string[];
    whatsAppNumebrs: string[];
    emails: string[];
    telegramNumbers: string[];
  }) {
    this.translation = data.translation;
    this.phonenumbers = data.phonenumbers;
    this.whatsAppNumebrs = data.whatsAppNumebrs;
    this.emails = data.emails;
    this.telegramNumbers = data.telegramNumbers;
  }

  toMap(): { [p: string]: any } {
    return {
      translations: this.translation.toMap(),
      phone_numbers: this.phonenumbers,
      whatsapp_numbers: this.whatsAppNumebrs,
      emails: this.emails,
      telegram_numbers: this.telegramNumbers,
    };
  }

  validate() {
    return EditSupportContactsParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditSupportContactsParams.validation.validateOrThrow(this);
  }
}
