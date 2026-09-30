import type Params from '@/base/Core/Params/params';

import {
  ClassValidation,
  type FieldError,
  ValidationError,
} from '@/base/Presentation/Utils/classValidation';

import type TranslationParams from '@/base/Core/Params/translationParams';

import {
  hasDescriptionTranslation,
  hasSelectValue,
  hasTitleTranslation,
} from '@/base/Presentation/Utils/input_title';

import { translate } from '@/locales/i18n';

import { type ServiceType } from '@/modules/MainOrganization/Project/core/constants/serviceType.enum';

export interface ProjectAttachmentParams {
  file: string;
  attachment_type_id?: number;
  name?: string;
  size?: number | string;
}

export type WithPreviewValue = 0 | 1;

const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{6,19}$/;

const hasText = (value?: string): boolean => Boolean(value?.trim());

const hasValidPhone = (value?: string): boolean =>
  Boolean(value?.trim() && PHONE_PATTERN.test(value.trim()));

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

      custom: (value?: TranslationParams) => {
        if (!hasTitleTranslation(value)) return translate('validation.title_required');

        return true
      },
    },

    client_exist: {
      custom: (value?: boolean) =>
        value === true || value === false || translate('Project.validation.client_type_required'),
    },

    project_type_id: {
      required: true,
      custom: (value?: number) =>
        hasSelectValue(value) || translate('Project.validation.project_type_required'),
    },

    service_type: {
      required: true,
      custom: (value?: ServiceType) =>
        hasSelectValue(value) || translate('Project.validation.service_type_required'),
    },

    location_id: {
      required: true,
      custom: (value?: number) =>
        hasSelectValue(value) || translate('Project.validation.city_required'),
    },

    date: {
      required: true,
      custom: (value?: string) =>
        hasText(value) || translate('Project.validation.date_required'),
    },

    terms: {
      required: true,
      custom: (value?: string) =>
        hasText(value) || translate('Project.validation.terms_required'),
    },

    attachments: {
      custom: (value?: ProjectAttachmentParams[]) =>
        !value?.length ||
        value.every(
          (attachment) =>
            hasText(attachment.file) &&
            Number.isInteger(Number(attachment.attachment_type_id)) &&
            Number(attachment.attachment_type_id) > 0,
        ) ||
        translate('Project.validation.attachment_incomplete'),
    },
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

      with_preview: this.with_preview,
    };
  }

  private getConditionalErrors(): FieldError[] {
    const errors: FieldError[] = [];

    if (this.client_exist === true && !hasSelectValue(this.client_id)) {
      errors.push({
        field: 'client_id',

        message: translate('Project.validation.client_required'),
      });
    }

    if (this.client_exist === false && !hasSelectValue(this.client_source)) {
      errors.push({
        field: 'client_source',

        message: translate('Project.validation.client_source_required'),
      });
    }

    if (this.client_exist === false && !hasText(this.client_name)) {
      errors.push({
        field: 'client_name',

        message: translate('Project.validation.client_name_required'),
      });
    }

    if (this.client_exist === false && !hasText(this.client_phone)) {
      errors.push({
        field: 'client_phone',

        message: translate('Project.validation.client_phone_required'),
      });
    } else if (this.client_exist === false && !hasValidPhone(this.client_phone)) {
      errors.push({
        field: 'client_phone',

        message: translate('Project.validation.client_phone_invalid'),
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

  validateOrThrow(): void {
    const validation = this.validate();

    if (!validation.isValid) {
      const validationError = new ValidationError(validation.errors);

      validationError.openDialog();
    }
  }
}
