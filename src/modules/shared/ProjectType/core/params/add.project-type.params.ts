import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type { ProjectType } from '../constant/project-type.enum';

export default class AddProjectTypeParams implements Params {
  public name?: string;
  public projectType?: ProjectType;

  public static readonly validation = new ClassValidation().setRules({
    name: { required: true },
    projectType: { required: true },
  });

  constructor(data: { name?: string; projectType?: ProjectType }) {
    this.name = data.name;
    this.projectType = data.projectType;
  }

  toMap(): Record<string, unknown> {
    return { name: this.name, project_type: this.projectType };
  }

  validate() {
    return AddProjectTypeParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddProjectTypeParams.validation.validateOrThrow(this);
  }
}
