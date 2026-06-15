import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type { ProjectTypeEnum } from '../constant/project.type.enum';

export default class AddProjectParams implements Params {
  public name?: string;
  public projectType?: ProjectTypeEnum;

  public static readonly validation = new ClassValidation().setRules({
    name: { required: true },
    projectType: { required: true },
  });

  constructor(data: { name?: string; projectType?: ProjectTypeEnum }) {
    this.name = data.name;
    this.projectType = data.projectType;
  }

  toMap(): Record<string, unknown> {
    return { name: this.name, project_type: this.projectType };
  }

  validate() {
    return AddProjectParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddProjectParams.validation.validateOrThrow(this);
  }
}
