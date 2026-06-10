import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type EducationSubjectParams from './education.subject.params';
import type TranslationParams from '../translation.params';

/**
 * Parameters for adding a new country
 */
export default class AddEducationSubjectParams implements Params {
  public educationClassificatioId: number;
  public numberOfBranches: number;
  public translation: TranslationParams;
  public branches: EducationSubjectParams[];

  public static readonly validation = new ClassValidation().setRules({
    educationClassificatioId: { required: true },
  });

  constructor(data: {
    educationClassificatioId: number;
    numberOfBranches: number;
    translation: TranslationParams;
    branches: EducationSubjectParams[];
  }) {
    this.educationClassificatioId = data.educationClassificatioId;
    this.numberOfBranches = data.numberOfBranches;
    this.translation = data.translation;
    this.branches = data.branches;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      education_classification_id: this.educationClassificatioId,
      number_of_branches: this.numberOfBranches,
      translations: this.translation.toMap(),
      branches: this.branches.map((branch) => branch.toMap()),
    };
    return map;
  }

  validate() {
    return AddEducationSubjectParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddEducationSubjectParams.validation.validateOrThrow(this);
  }
}
