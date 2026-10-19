import ReportAttachmentParams from './report.attachment.params';
import { ReportScopeType } from '../constants/work-items.constants';
import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { positiveId, dateOnly, type SiteSafetyStatus } from '../constants/work-items.constants';
export default class StoreReportParams implements Params {
  public projectTimelineStageId: number;
  public date: string;
  public notes: string | null;
  public siteSafetyStatus: SiteSafetyStatus;
  public reportScopeType: ReportScopeType;
  public projectFloorSpaceId: number | null;
  public attachments: ReportAttachmentParams[];
  constructor(
    projectTimelineStageId: number,
    date: string,
    notes: string | null,
    siteSafetyStatus: SiteSafetyStatus,
    reportScopeType: ReportScopeType = ReportScopeType.ALL_PROJECT,
    projectFloorSpaceId: number | null = null,
    attachments: ReportAttachmentParams[] = [],
  ) {
    this.projectTimelineStageId = projectTimelineStageId;
    this.date = date;
    this.reportScopeType = reportScopeType;
    this.projectFloorSpaceId = projectFloorSpaceId;
    this.attachments = attachments;
    this.notes = notes;
    this.siteSafetyStatus = siteSafetyStatus;
  }
  private static validation = new ClassValidation().setRules({
    projectTimelineStageId: { required: true, custom: positiveId },
    reportScopeType: { required: true, custom: (value: unknown) => value === 1 || value === 2 },
    projectFloorSpaceId: {
      required: (fields) => fields.reportScopeType === ReportScopeType.SPECIFIC_SPACE,
      custom: positiveId,
    },
    attachments: {
      custom: (value: unknown) =>
        Array.isArray(value) &&
        value.every(
          (entry) =>
            entry instanceof ReportAttachmentParams && /^data:[^;]+;base64,.+/.test(entry.file),
        ),
    },
    date: { required: true, custom: dateOnly },
    siteSafetyStatus: {
      required: true,
      custom: (status: unknown) => [1, 2, 3].includes(Number(status)) && typeof status === 'number',
    },
  });
  toMap() {
    return {
      project_timeline_stage_id: this.projectTimelineStageId,
      date: this.date,
      notes: this.notes,
      report_scope_type: this.reportScopeType,
      ...(this.reportScopeType === ReportScopeType.SPECIFIC_SPACE
        ? { project_floor_space_id: this.projectFloorSpaceId }
        : {}),
      attachments: this.attachments.map((attachment) => attachment.toMap()),
      site_safety_status: this.siteSafetyStatus,
    };
  }
  validate() {
    return StoreReportParams.validation.validate(this);
  }
  validateOrThrow() {
    StoreReportParams.validation.validateOrThrow(this);
  }
}
