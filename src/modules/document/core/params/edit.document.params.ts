import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type DocumentTranslationParams from './translation.params';

export default class EditDocumentParams implements Params {
  public document_id: number;
  public documentTypeId: number;
  public subjects: number;
  public stage_id: number;
  public translations: DocumentTranslationParams;
  public tags: string[];
  public images: string[];
  public files: string[];

  public static readonly validation = new ClassValidation().setRules({
    document_id: { required: true },
    translations: { required: true },
  });

  constructor(data: {
    document_id: number;
    documentTypeId: number;
    stage_id: number;
    subjects: number;
    translations: DocumentTranslationParams;
    tags: string[];
    images: string[];
    files: string[];
  }) {
    this.document_id = data.document_id;
    this.documentTypeId = data.documentTypeId;
    this.stage_id = data.stage_id;
    this.subjects = data.subjects;
    this.translations = data.translations;
    this.tags = data.tags;
    this.images = data.images;
    this.files = data.files;
  }

  // ← تحويل URL لـ base64
  static async urlToBase64(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return '';
    }
  }

  static isBase64(str: string): boolean {
    if (!str || typeof str !== 'string') return false;
    return str.startsWith('data:');
  }

  // ← جهز الـ params وحول الـ URLs لـ base64 قبل الإرسال
  static async prepare(params: EditDocumentParams): Promise<EditDocumentParams> {
    const images = await Promise.all(
      params.images.map((img) =>
        EditDocumentParams.isBase64(img) ? img : EditDocumentParams.urlToBase64(img),
      ),
    );
    const files = await Promise.all(
      params.files.map((file) =>
        EditDocumentParams.isBase64(file) ? file : EditDocumentParams.urlToBase64(file),
      ),
    );
    params.images = images.filter(Boolean);
    params.files = files.filter(Boolean);
    return params;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      document_id: this.document_id,
      document_type_id: this.documentTypeId,
      stage_id: this.stage_id,
      subject_id: this.subjects,
      translations: this.translations.toMap(),
      document_tags: this.tags,
    };

    // ← بعت الصورة/الملف بس لو base64
    if (this.images?.[0] && EditDocumentParams.isBase64(this.images[0])) {
      map['image'] = this.images[0];
    }
    if (this.files?.[0] && EditDocumentParams.isBase64(this.files[0])) {
      map['document_file'] = this.files[0];
    }

    return map;
  }

  validate() {
    return EditDocumentParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditDocumentParams.validation.validateOrThrow(this);
  }
}