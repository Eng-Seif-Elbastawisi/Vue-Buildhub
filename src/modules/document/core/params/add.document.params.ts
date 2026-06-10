import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type DocumentTranslationParams from './translation.params';

export default class AddDocumentParams implements Params {
 
  public refNumber: string;
  public documentTypeId: number;
  public subjects: number;
  public stage_id:number;
  public translations: DocumentTranslationParams;
  public tags: string[];
  public images: string;
  public files: string;

  public static readonly validation = new ClassValidation().setRules({
    translations: {   required: true  },
  });

  constructor(data: {
    refNumber: string;
    documentTypeId: number;
    stage_id:number;
    subjects: number;
    translations: DocumentTranslationParams;
    tags: string[];
    images: string;
    files: string;
  }) {
    this.refNumber = data.refNumber;
    this.documentTypeId = data.documentTypeId;
    this.stage_id = data.stage_id;
    this.subjects = data.subjects;
    this.translations = data.translations;
    this.tags = data.tags;
    this.images = data.images;
    this.files = data.files;
  }

  toMap(): { [p: string]: any } {
    return {
      reference_number: this.refNumber,
      document_type_id: this.documentTypeId,
      stage_id: this.stage_id,
      subject_id: this.subjects,
      translations: this.translations.toMap(),
      document_tags: this.tags,
      image: this.images,
      document_file: this.files,
    };
  }

  validate() {
    return AddDocumentParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddDocumentParams.validation.validateOrThrow(this);
  }
}
