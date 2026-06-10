import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type ContactsParams from './contacts.paras';
import type TranslationParams from '@/modules/about/core/params/translation.params';

/**
 * Parameters for adding a new employee
 */
export default class AddSupportContactsParams implements Params {
  public readonly translations: TranslationParams;
  public readonly contacts: ContactsParams[];

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: { translations: TranslationParams; contacts: ContactsParams[] }) {
    this.translations = data.translations;
    this.contacts = data.contacts;
  }

  toMap(): { [p: string]: any } {
    return {
      translations: this.translations,
      support_contacts: this.contacts.map((contact) => contact.toMap()),
    };
  }

  validate() {
    return AddSupportContactsParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddSupportContactsParams.validation.validateOrThrow(this);
  }
}
