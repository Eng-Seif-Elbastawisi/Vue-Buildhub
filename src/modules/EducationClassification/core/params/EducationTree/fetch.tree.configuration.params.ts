import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for updating an existing country
 */
export default class FetchTreeConfigurationTreeParams implements Params {
  public education_classification_id?: number;
  public branch_id?: number;

  public static readonly validation = new ClassValidation().setRules({
    education_classification_id: { required: true, minLength: 1, maxLength: 100 },
    branch_id: { required: true, minLength: 2, maxLength: 100 },
  });

  constructor(data: { education_classification_id?: number; branch_id?: number }) {
    this.education_classification_id = data.education_classification_id;
    this.branch_id = data.branch_id;
  }

  toMap(): { [p: string]: any } {
    return {
      education_classification_id: this.education_classification_id,
      branch_id: this.branch_id,
    };
  }

  validate() {
    return FetchTreeConfigurationTreeParams.validation.validate(this);
  }

  validateOrThrow() {
    return FetchTreeConfigurationTreeParams.validation.validateOrThrow(this);
  }
}
