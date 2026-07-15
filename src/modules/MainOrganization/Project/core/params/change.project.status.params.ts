import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import type { ConvertStatus } from '../constants/convert.status.enum';

export default class ChangeProjectStatusParams implements Params {
  public readonly projectId: number;
  public readonly status: ConvertStatus;
  public readonly notes: string;

  public static readonly validation = new ClassValidation().setRules({
    projectId: { required: true },
    status: requiredSelectRule(),
  });

  constructor(data: { projectId: number; status: ConvertStatus; notes?: string }) {
    this.projectId = data.projectId;
    this.status = data.status;
    this.notes = data.notes ?? '';
  }

  toMap(): Record<string, number | string> {
    return {
      project_id: this.projectId,
      status: this.status,
      notes: this.notes,
    };
  }

  validate() {
    return ChangeProjectStatusParams.validation.validate(this);
  }

  validateOrThrow() {
    return ChangeProjectStatusParams.validation.validateOrThrow(this);
  }
}
