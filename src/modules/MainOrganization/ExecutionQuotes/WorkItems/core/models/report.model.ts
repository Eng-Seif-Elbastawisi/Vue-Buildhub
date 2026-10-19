import ExecutionQuoteAttachmentModel from '../../../core/models/execution.quote.attachment.model';
import { type ReportScopeType } from '../constants/work-items.constants';
import PurchaseRequestProjectFloorSpaceModel from '../../../Procurement/core/models/purchase-request.project-floor-space.model';
import type EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import {
  responseObject,
  responseId,
  responseText,
  nullableText,
  employeeReference,
} from './work-items.response';
import { type SiteSafetyStatus } from '../constants/work-items.constants';
export default class DailyReportModel {
  readonly reportScopeType: ReportScopeType | null;
  readonly attachments: ExecutionQuoteAttachmentModel[];
  readonly projectFloorSpaceId: number | null;
  readonly projectFloorSpace: PurchaseRequestProjectFloorSpaceModel | null;
  public readonly id: number;
  public readonly projectTimelineStageId: number;
  public readonly employee: EmployeeModel;
  public readonly createdAt: string | null;
  public readonly date: string;
  public readonly notes: string | null;
  public readonly siteSafetyStatus: SiteSafetyStatus;
  constructor(record: {
    reportScopeType?: ReportScopeType | null;
    attachments?: ExecutionQuoteAttachmentModel[];
    projectFloorSpaceId?: number | null;
    projectFloorSpace?: PurchaseRequestProjectFloorSpaceModel | null;
    id: number;
    projectTimelineStageId: number;
    employee: EmployeeModel;
    createdAt: string | null;
    date: string;
    notes: string | null;
    siteSafetyStatus: SiteSafetyStatus;
  }) {
    this.projectFloorSpaceId = record.projectFloorSpaceId ?? null;
    this.projectFloorSpace = record.projectFloorSpace ?? null;
    this.id = record.id;
    this.reportScopeType = record.reportScopeType ?? null;
    this.attachments = record.attachments ?? [];
    this.projectTimelineStageId = record.projectTimelineStageId;
    this.employee = record.employee;
    this.createdAt = record.createdAt;
    this.date = record.date;
    this.notes = record.notes;
    this.siteSafetyStatus = record.siteSafetyStatus;
  }
  static fromJson(payload: unknown): DailyReportModel {
    const record = responseObject(payload);
    if (
      ![1, 2, 3].includes(Number(record.site_safety_status)) ||
      typeof record.site_safety_status !== 'number'
    )
      throw new Error('work_items.invalid_response');
    if (
      record.report_scope_type != null &&
      record.report_scope_type !== 1 &&
      record.report_scope_type !== 2
    )
      throw new Error('work_items.invalid_response');
    if (record.attachments != null && !Array.isArray(record.attachments))
      throw new Error('work_items.invalid_response');
    return new DailyReportModel({
      reportScopeType: (record.report_scope_type as ReportScopeType | null | undefined) ?? null,
      attachments: (record.attachments ?? []).map((attachment: unknown) =>
        ExecutionQuoteAttachmentModel.fromJson(responseObject(attachment)),
      ),
      projectFloorSpaceId:
        record.project_floor_space_id == null ? null : responseId(record.project_floor_space_id),
      projectFloorSpace:
        record.project_floor_space == null
          ? null
          : PurchaseRequestProjectFloorSpaceModel.fromJson(record.project_floor_space),
      id: responseId(record.id),
      projectTimelineStageId: responseId(record.project_timeline_stage_id),
      employee: employeeReference(record.employee),
      createdAt: nullableText(record.created_at),
      date: responseText(record.date),
      notes: nullableText(record.notes),
      siteSafetyStatus: record.site_safety_status as SiteSafetyStatus,
    });
  }
}
