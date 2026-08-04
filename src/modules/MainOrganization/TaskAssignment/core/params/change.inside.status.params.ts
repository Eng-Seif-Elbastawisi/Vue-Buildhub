import type Params from '@/base/Core/Params/params';
import type { InsideStatusDecisionValue } from '../constants/inside.status.decision.enum';

export default class ChangeInsideStatusParams implements Params {
  public readonly project_department_item_id: number;
  public readonly status: InsideStatusDecisionValue;

  constructor(request: { projectDepartmentItemId: number; status: InsideStatusDecisionValue }) {
    this.project_department_item_id = request.projectDepartmentItemId;
    this.status = request.status;
  }

  toMap(): Record<string, number> {
    return {
      project_department_item_id: this.project_department_item_id,
      status: this.status,
    };
  }
}
