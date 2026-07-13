import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/base/Core/Params/translationParams';
import { type ServiceType } from '@/modules/MainOrganization/Project/core/constants/serviceType.enum';

export interface ProjectAttachmentParams {
  file: string;
}

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

  public static readonly validation = new ClassValidation().setRules({});

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
  }

  toMap(): Record<string, unknown> {
    return {
      translations: this.translations?.toMap(),
      client_exist: this.client_exist,
      client_id: this.client_id,
      client_name: this.client_name,
      client_phone: this.client_phone,
      client_source: this.client_source,
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
    };
  }

  validate() {
    return AddProjectParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddProjectParams.validation.validateOrThrow(this);
  }
}
