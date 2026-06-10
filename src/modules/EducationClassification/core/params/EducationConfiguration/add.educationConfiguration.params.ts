import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type ConfigurationParams from './Configuration.params';

/**
 * Parameters for adding a new country
 */
export default class AddEducationConfigurationParams implements Params {
  public educationClassificatioId: number;
  public numberOfBranches: number;
  public branches: ConfigurationParams[];

  public static readonly validation = new ClassValidation().setRules({
    educationClassificatioId: { required: true },
    numberOfBranches: { required: true },
    branches: { required: true },
  });

  constructor(data: {
    educationClassificatioId: number;
    numberOfBranches: number;
    branches: ConfigurationParams[];
  }) {
    this.educationClassificatioId = data.educationClassificatioId;
    this.numberOfBranches = data.numberOfBranches;
    this.branches = data.branches;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      education_classification_id: this.educationClassificatioId,
      number_of_branches: this.numberOfBranches,
      branches: this.branches.map((branch) => branch.toMap()),
    };
    return map;
  }

  validate() {
    return AddEducationConfigurationParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddEducationConfigurationParams.validation.validateOrThrow(this);
  }
}
