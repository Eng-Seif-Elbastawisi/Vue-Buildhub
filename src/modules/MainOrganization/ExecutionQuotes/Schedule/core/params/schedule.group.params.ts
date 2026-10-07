import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { durationTypes, validId, type TaskDurationType } from '../constants/schedule.constants';
import ScheduleOwnerParams from './schedule.owner.params';
import type ProjectTimelineStageParams from './project.timeline.stage.params';

export default class ScheduleGroupParams extends ScheduleOwnerParams {
  static readonly groupValidation = new ClassValidation().setRules({
    title: { required: true },
    duration: {
      required: true,
      custom: (duration: number) => Number.isFinite(duration) && duration > 0,
    },
    durationType: {
      required: true,
      custom: (unit: TaskDurationType) => durationTypes.includes(unit),
    },
    stages: {
      required: true,
      custom: (selections: ProjectTimelineStageParams[]) =>
        selections.every(
          (selection) =>
            validId(selection.quoteStageId) &&
            selection.children.every(validId) &&
            new Set(selection.children).size === selection.children.length,
        ) &&
        new Set(selections.map((selection) => selection.quoteStageId)).size === selections.length &&
        new Set(selections.flatMap((selection) => selection.children)).size ===
          selections.flatMap((selection) => selection.children).length,
    },
  });
  public title: string;
  public duration: number;
  public durationType: TaskDurationType | '';
  public stages: ProjectTimelineStageParams[];
  constructor(form: {
    quoteId: number;
    groupId?: number;
    title: string;
    duration: number;
    durationType: TaskDurationType | '';
    stages: ProjectTimelineStageParams[];
  }) {
    super(form.quoteId, form.groupId);
    this.title = form.title;
    this.duration = form.duration;
    this.durationType = form.durationType;
    this.stages = form.stages;
  }
  toMap() {
    return {
      ...super.toMap(),
      title: this.title,
      duration: this.duration,
      duration_type: this.durationType,
      stages: this.stages.map((selection) => selection.toMap()),
    };
  }
  validate() {
    const errors = [
      ...super.validate().errors,
      ...ScheduleGroupParams.groupValidation.validate(this).errors,
    ];
    return { isValid: errors.length === 0, errors };
  }
  validateOrThrow() {
    super.validateOrThrow();
    ScheduleGroupParams.groupValidation.validateOrThrow(this);
  }
}
