import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/base/Core/Params/translationParams';
import { ServiceType } from '@/modules/MainOrganization/Project/core/constants/serviceType.enum';

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
  public attachments?: string;

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
    attachments?: string;
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
    };
  }

  validate() {
    return AddProjectParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddProjectParams.validation.validateOrThrow(this);
  }
}
