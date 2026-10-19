import PurchaseRequestProjectFloorSpaceModel from '../../../Procurement/core/models/purchase-request.project-floor-space.model';
import type EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import ShopDrawingTimelineStageModel from './shop-drawing.timeline-stage.model';
import {
  responseObject,
  responseId,
  responseText,
  nullableText,
  optionalEmployee,
} from './work-items.response';
export default class ShopDrawingQuoteModel {
  readonly projectFloorSpaceId: number | null;
  readonly projectFloorSpace: PurchaseRequestProjectFloorSpaceModel | null;
  readonly id: number;
  readonly employee: EmployeeModel | null;
  readonly quoteId: number;
  readonly projectId: number | null;
  readonly title: string;
  readonly date: string | null;
  readonly versionNumber: string;
  readonly file: string | null;
  readonly customNumber: number | null;
  readonly stages: ShopDrawingTimelineStageModel[];
  readonly createdAt: string | null;
  constructor(fields: {
    projectFloorSpaceId?: number | null;
    projectFloorSpace?: PurchaseRequestProjectFloorSpaceModel | null;
    id: number;
    employee: EmployeeModel | null;
    quoteId: number;
    projectId: number | null;
    title: string;
    date: string | null;
    versionNumber: string;
    file: string | null;
    customNumber: number | null;
    stages: ShopDrawingTimelineStageModel[];
    createdAt: string | null;
  }) {
    this.projectFloorSpaceId = fields.projectFloorSpaceId ?? null;
    this.projectFloorSpace = fields.projectFloorSpace ?? null;
    this.id = fields.id;
    this.employee = fields.employee;
    this.quoteId = fields.quoteId;
    this.projectId = fields.projectId;
    this.title = fields.title;
    this.date = fields.date;
    this.versionNumber = fields.versionNumber;
    this.file = fields.file;
    this.customNumber = fields.customNumber;
    this.stages = fields.stages;
    this.createdAt = fields.createdAt;
  }
  static fromJson(payload: unknown) {
    const record = responseObject(payload);
    if (!Array.isArray(record.stages)) throw new Error('work_items.invalid_response');
    return new ShopDrawingQuoteModel({
      projectFloorSpaceId:
        record.project_floor_space_id == null ? null : responseId(record.project_floor_space_id),
      projectFloorSpace:
        record.project_floor_space == null
          ? null
          : PurchaseRequestProjectFloorSpaceModel.fromJson(record.project_floor_space),
      id: responseId(record.id),
      employee: optionalEmployee(record.employee),
      quoteId: responseId(record.quote_id),
      projectId: record.project_id == null ? null : responseId(record.project_id),
      title: responseText(record.title),
      date: nullableText(record.date),
      versionNumber: responseText(record.version_number),
      file: nullableText(record.file),
      customNumber: record.custom_number == null ? null : responseId(record.custom_number),
      stages: record.stages.map(ShopDrawingTimelineStageModel.fromJson),
      createdAt: nullableText(record.created_at),
    });
  }
}
