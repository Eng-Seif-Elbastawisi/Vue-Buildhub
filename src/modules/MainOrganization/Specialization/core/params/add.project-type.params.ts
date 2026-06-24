import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type { ProjectType } from '../constant/project-type.enum';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class AddProjectTypeParams implements Params {
  public name?: string;
  public projectType?: ProjectType;
  public translations?: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    // name: { required: true },
    // projectType: { required: true },
    //  translations: { required: true },
  });

  constructor(data: {
    name?: string;
    projectType?: ProjectType;
    translations?: TranslationParams;
  }) {
    this.name = data.name;
    this.projectType = data.projectType;
    this.translations = data.translations;
  }

  toMap(): Record<string, unknown> {
    return {
      name: this.name,
      project_type: this.projectType,
      translations: this.translations?.toMap(),
    };
  }

  validate() {
    return AddProjectTypeParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddProjectTypeParams.validation.validateOrThrow(this);
  }
}
