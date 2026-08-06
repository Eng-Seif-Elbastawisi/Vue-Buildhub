import type Params from '@/base/Core/Params/params';

import {
  ClassValidation,
  type FieldError,
  ValidationError,
} from '@/base/Presentation/Utils/classValidation';

import type TranslationParams from '@/base/Core/Params/translationParams';

import {
  hasSelectValue,
  hasTitleTranslation,
  requiredSelectRule,
} from '@/base/Presentation/Utils/input_title';

import { translate } from '@/locales/i18n';

import { type ServiceType } from '@/modules/MainOrganization/Project/core/constants/serviceType.enum';

export interface ProjectAttachmentParams {
  file: string;
}

export type WithPreviewValue = 0 | 1;

export default class AddProjectParams implements Params {
  public translations?: TranslationParams;

  public client_exist?: boolean;

  public client_id?: number;

  public client_name?: string;

  public client_phone?: string;

  public client_source?: number;

  public project_type_id?: number;

  public location_id?: number;

  public service_type?: ServiceType;

  public date?: string;

  public notes?: string;

  public attachments?: ProjectAttachmentParams[];

  public engineer_id?: number;

  public preview_date?: string;

  public preview_time?: string;

  public site_link?: string;

  public address?: string;

  public terms?: string;

  public with_preview?: WithPreviewValue;

  public static readonly validation = new ClassValidation().setRules({
    translations: {
      required: true,

      custom: (value?: TranslationParams) =>
        hasTitleTranslation(value) || translate('validation.title_required'),
    },

    client_exist: requiredSelectRule(),

    project_type_id: requiredSelectRule(),

    service_type: requiredSelectRule(),
    
    location_id: requiredSelectRule(),
  });

  constructor(data: {
    translations?: TranslationParams;

    client_exist?: boolean;

    client_id?: number;

    client_name?: string;

    client_phone?: string;

    client_source?: number;

    project_type_id?: number;

    location_id?: number;

    service_type?: ServiceType;

    date?: string;

    notes?: string;

    attachments?: ProjectAttachmentParams[];

    engineer_id?: number;

    preview_date?: string;

    preview_time?: string;

    site_link?: string;

    address?: string;

    terms?: string;

    /**
     * يمكن إرسال:
     *
     * true أو 1  → تتحول إلى 1
     * false أو 0 → تتحول إلى 0
     */
    with_preview?: boolean | WithPreviewValue;
  }) {
    this.translations = data.translations;

    this.client_exist = data.client_exist;

    this.client_id = data.client_id;

    this.client_name = data.client_name;

    this.client_phone = data.client_phone;

    this.client_source = data.client_source;

    this.project_type_id = data.project_type_id;

    this.location_id = data.location_id;

    this.service_type = data.service_type;

    this.date = data.date;

    this.notes = data.notes;

    this.attachments = data.attachments;

    this.engineer_id = data.engineer_id;

    this.preview_date = data.preview_date;

    this.preview_time = data.preview_time;

    this.site_link = data.site_link;

    this.address = data.address;

    this.terms = data.terms;

    this.with_preview =
      data.with_preview === undefined
        ? undefined
        : data.with_preview === true || data.with_preview === 1
          ? 1
          : 0;
  }

  toMap(): Record<string, unknown> {
    return {
      translations: this.translations?.toMap(),

      client_exist: this.client_exist,

      client_id: this.client_id,

      client_name: this.client_name,

      client_phone: this.client_phone,

      client_source_id: this.client_source,

      project_type_id: this.project_type_id,

      location_id: this.location_id,

      service_type: this.service_type,

      date: this.date,

      notes: this.notes,

      attachments: this.attachments,

      engineer_id: this.engineer_id,

      preview_date: this.preview_date,

      preview_time: this.preview_time,

      site_link: this.site_link,

      address: this.address,

      terms: this.terms,

      /**
       * القيمة النهائية في الـ request ستكون 0 أو 1.
       */
      with_preview: this.with_preview,
    };
  }

  private getConditionalErrors(): FieldError[] {
    const errors: FieldError[] = [];

    if (this.client_exist === true && !hasSelectValue(this.client_id)) {
      errors.push({
        field: 'client_id',

        message: translate('validation.select_required'),
      });
    }

    if (this.client_exist === false && !hasSelectValue(this.client_source)) {
      errors.push({
        field: 'client_source',

        message: translate('validation.select_required'),
      });
    }

    return errors;
  }

  validate() {
    const validation = AddProjectParams.validation.validate(this);

    const errors = [...validation.errors, ...this.getConditionalErrors()];

    return {
      isValid: errors.length === 0,

      errors,
    };
  }

  validateOrThrow() {
    const validation = this.validate();

    if (!validation.isValid) {
      const validationError = new ValidationError(validation.errors);

      validationError.openDialog();
    }
  }
}
