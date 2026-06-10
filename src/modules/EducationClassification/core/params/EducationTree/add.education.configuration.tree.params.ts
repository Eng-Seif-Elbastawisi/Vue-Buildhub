import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for updating an existing country
 */
export default class AddEducationConfigurationTreeParams implements Params {
  public education_classification_id?: number;
  public branch_id?: number;
  public branch_title?: string;

  public static readonly validation = new ClassValidation().setRules({
    education_classification_id: { required: true, minLength: 1, maxLength: 100 },
    branch_title: { required: true, minLength: 2, maxLength: 100 },
  });

  constructor(data: {
    education_classification_id?: number;
    branch_id?: number;
    branch_title?: string;
  }) {
    this.education_classification_id = data.education_classification_id;
    this.branch_id = data.branch_id;
    this.branch_title = data.branch_title;
  }

  toMap(): { [p: string]: any } {
    return {
      education_classification_id: this.education_classification_id,
      branch_id: this.branch_id,
      branch_title: this.branch_title,
    };
  }

  validate() {
    return AddEducationConfigurationTreeParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddEducationConfigurationTreeParams.validation.validateOrThrow(this);
  }
}
