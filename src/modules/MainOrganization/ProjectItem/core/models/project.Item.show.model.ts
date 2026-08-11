import TitleInterface from '@/base/Data/Models/titleInterface';
import { ProjectItemPriceEnum } from '../constant/project.item.Price.enum';
import OrganizationShowModel from '@/modules/shared/Organization/core/models/organization.show.model';
import OrganizationEmployeeModel from '@/modules/shared/Organization/core/models/employee.model';
import ItemShowModel from '@/modules/shared/Item/core/models/Item.show.model';
import {  ProjectFloorShowModel } from '@/modules/MainOrganization/ProjectFloor';
import ProjectAttachmentModel from '@/modules/MainOrganization/Project/core/models/project.show.attachment';
import type ProjectHistoryModel from './project.history.model';
import ProjectSimpleModel from './project.simple.model';
import type { InsideStatusType } from '@/modules/MainOrganization/TaskAssignment/core/constants/inside.status.enum';
import type { TaskDurationType } from '@/modules/MainOrganization/TaskAssignment/core/constants/taskDurationType.enum';
import TitleModel from '@/base/Core/Models/titleModel';

export default class ProjectItemShowModel { 
  public readonly id?: number;
  public readonly price?: number;
  public readonly quantity?: number;
  public readonly item_id?: TitleInterface<number>;
  public readonly pricing_method?: ProjectItemPriceEnum;
  public readonly project_floor_id?: number;
  public readonly uuid?: string;
  public readonly has_attached?: boolean;
  public readonly is_assign_employee?: boolean;
  public readonly organization?: OrganizationShowModel;
  public readonly employee?: OrganizationEmployeeModel;
  public readonly default_employee?: OrganizationEmployeeModel;
  public readonly project?: ProjectSimpleModel;
  public readonly item?: ItemShowModel;
  public readonly project_floor?: ProjectFloorShowModel;
  public readonly project_floor_space?: ProjectFloorShowModel | null;
  public readonly final_price?: number;
  public readonly attachments?: ProjectAttachmentModel[];
  public readonly assigned_employees?: OrganizationEmployeeModel[];
  public readonly histories?:  ProjectHistoryModel[];
  public readonly department?: string;
  public readonly inside_status?: InsideStatusType;
  public readonly duration?: number;
  public readonly duration_type?: TaskDurationType;
  public readonly reviewer?: TitleModel;


  constructor(data: {
    id?: number;
    price?: number;
    quantity?: number;
    item_id?: TitleInterface<number>;
    pricing_method?: ProjectItemPriceEnum;
    project_floor_id?: number;
    uuid?: string;
    has_attached?: boolean;
    is_assign_employee?: boolean;
    organization?: OrganizationShowModel;
    employee?: OrganizationEmployeeModel;
    default_employee?: OrganizationEmployeeModel;
    project?: ProjectSimpleModel;
    item?: ItemShowModel;
    project_floor?: ProjectFloorShowModel;
    project_floor_space?: ProjectFloorShowModel | null;
    final_price?: number;
    attachments?: ProjectAttachmentModel[];
    assigned_employees?: OrganizationEmployeeModel[];
    histories?: ProjectHistoryModel[];
    department?: string;
    inside_status?: InsideStatusType;
    duration?: number;
    duration_type?: TaskDurationType;
    reviewer?: TitleModel;
  }) {
    this.id = data.id;
    this.price = data.price;
    this.quantity = data.quantity;
    this.item_id = data.item_id;
    this.pricing_method = data.pricing_method;
    this.project_floor_id = data.project_floor_id;
    this.uuid = data.uuid;
    this.has_attached = data.has_attached;
    this.is_assign_employee = data.is_assign_employee;
    this.organization = data.organization;
    this.employee = data.employee;
    this.default_employee = data.default_employee;
    this.project = data.project;
    this.item = data.item;
    this.project_floor = data.project_floor;
    this.project_floor_space = data.project_floor_space;
    this.final_price = data.final_price;
    this.attachments = data.attachments;
    this.assigned_employees = data.assigned_employees;
    this.histories = data.histories;
    this.department = data.department;
    this.inside_status = data.inside_status;
    this.duration = data.duration;
    this.duration_type = data.duration_type;
    this.reviewer = data.reviewer;
    this.project_floor = data.project_floor;

    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ProjectItemShowModel {
    if (!json) throw new Error('Invalid ProjectItemShowModel data');

   return new ProjectItemShowModel({
  id: json.id as number | undefined,
  price: json.price as number | undefined,
  quantity: json.quantity as number | undefined,
  item_id: new TitleInterface({id: json.item_id as number,title: json.item_id_title as string,}),
  pricing_method: json.pricing_method as ProjectItemPriceEnum | undefined,
  project_floor_id: json.project_floor_id as number | undefined,
  uuid: json.uuid as string | undefined,
  has_attached: json.has_attached as boolean | undefined,
  is_assign_employee: json.is_assign_employee as boolean | undefined,

  employee: json.employee   ? OrganizationEmployeeModel.fromJson( json.employee as Record<string, unknown> ) : undefined,
  project: json.project ? ProjectSimpleModel.fromJson( json.project as Record<string, unknown> ) : undefined,
  item: json.item ? ItemShowModel.fromJson( json.item as Record<string, unknown> ) : undefined,
  project_floor: json.project_floor ? ProjectFloorShowModel.fromJson( json.project_floor as Record<string, unknown> ) : undefined,
  final_price: json.final_price as number | undefined,
  attachments: (json.attachments as Record<string, unknown>[] | undefined)?.map((item) => ProjectAttachmentModel.fromJson(item)),
  assigned_employees: (  json.assigned_employees as Record<string, unknown>[] | undefined )?.map((item) => OrganizationEmployeeModel.fromJson(item)),
  histories: json.histories as ProjectHistoryModel[] | undefined,
  department: json.department as string | undefined,
  inside_status: json.inside_status as InsideStatusType | undefined,
  duration: json.duration as number | undefined,
  duration_type: json.duration_type as TaskDurationType | undefined,
  reviewer: json.reviewer ?  TitleModel.fromMap(json.reviewer) : undefined,
});
  }

  static example: ProjectItemShowModel = new ProjectItemShowModel({
    id: 1,
    price: 1,
    quantity: 1,
    item_id: new TitleInterface({ id: 1, title: 'Item 1' }),
    pricing_method: ProjectItemPriceEnum.GENERAL_ITEM,
    project_floor_id: 1,
  });
}
