import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { positiveId, dateOnly, WorkActivityType } from '../constants/work-items.constants';
export interface StoreActivityFields {
  projectTimelineStageId: number;
  type: WorkActivityType;
  title: string;
  date: string | null;
  description: string | null;
  employeeId: number | null;
}
export default class StoreActivityParams implements Params {
  public fields: StoreActivityFields;
  constructor(fields: StoreActivityFields) {
    this.fields = fields;
  }
  private static validation = new ClassValidation().setRules({
    projectTimelineStageId: { required: true, custom: positiveId },
    title: { required: true },
    type: {
      required: true,
      custom: (type: unknown) => typeof type === 'number' && [1, 2, 3, 4].includes(type),
    },
    date: { required: (fields) => fields.type === WorkActivityType.Meeting, custom: dateOnly },
    employeeId: { custom: positiveId },
  });
  toMap() {
    const fields = this.fields;
    const base = {
      project_timeline_stage_id: fields.projectTimelineStageId,
      type: fields.type,
      title: fields.title.trim(),
    };
    return fields.type === WorkActivityType.Meeting
      ? { ...base, date: fields.date }
      : { ...base, description: fields.description, employee_id: fields.employeeId };
  }
  private applicableFields() {
    return this.fields.type === WorkActivityType.Meeting
      ? { ...this.fields, employeeId: null }
      : { ...this.fields, date: null };
  }
  validate() {
    return StoreActivityParams.validation.validate(this.applicableFields());
  }
  validateOrThrow() {
    StoreActivityParams.validation.validateOrThrow(this.applicableFields());
  }
}
