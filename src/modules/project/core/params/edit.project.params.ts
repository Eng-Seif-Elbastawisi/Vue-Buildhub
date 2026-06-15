import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type { ProjectTypeEnum } from '../constant/project.type.enum';

export default class EditProjectParams implements Params {
  public projectId?: number;
  public name?: string;
  public projectType?: ProjectTypeEnum;

  public static readonly validation = new ClassValidation().setRules({
    projectId: { required: true },
    name: { required: true },
    projectType: { required: true },
  });

  constructor(data: { projectId?: number; name?: string; projectType?: ProjectTypeEnum }) {
    this.projectId = data.projectId;
    this.name = data.name;
    this.projectType = data.projectType;
  }

  toMap(): Record<string, unknown> {
    return { project_id: this.projectId, name: this.name, project_type: this.projectType };
  }

  validate() {
    return EditProjectParams.validation.validate(this);
  }
  validateOrThrow() {
    return EditProjectParams.validation.validateOrThrow(this);
  }
}
