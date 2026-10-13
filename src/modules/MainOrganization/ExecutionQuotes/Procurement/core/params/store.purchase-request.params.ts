import type Params from '@/base/Core/Params/params';
import { ClassValidation, ValidationError } from '@/base/Presentation/Utils/classValidation';
import { validId } from '../../../Schedule/core/constants/schedule.constants';
import {
  isPriority,
  isSupplyResponsibility,
  PurchaseRequestPriority,
  type SupplyResponsibility,
} from '../constants/purchase-request.constants';
import type PurchaseRequestItemParams from './purchase-request.item.params';

export default class StorePurchaseRequestParams implements Params {
  public quoteId: number;
  public employeeId: number;
  public isAllProject: boolean;
  public projectFloorSpaceId: number | null;
  public supplyResponsibility: SupplyResponsibility;
  public priority: PurchaseRequestPriority;
  public items: PurchaseRequestItemParams[];
  constructor(fields: {
    quoteId: number;
    employeeId: number;
    isAllProject: boolean;
    projectFloorSpaceId: number | null;
    supplyResponsibility: SupplyResponsibility;
    priority?: PurchaseRequestPriority;
    items: PurchaseRequestItemParams[];
  }) {
    this.quoteId = fields.quoteId;
    this.employeeId = fields.employeeId;
    this.isAllProject = fields.isAllProject;
    this.projectFloorSpaceId = fields.projectFloorSpaceId;
    this.supplyResponsibility = fields.supplyResponsibility;
    this.priority = fields.priority ?? PurchaseRequestPriority.NORMAL;
    this.items = fields.items;
  }
  private static validation = new ClassValidation().setRules({
    quoteId: { required: true, custom: validId },
    employeeId: { required: true, custom: validId, labelKey: 'procurement_employee' },
    isAllProject: {
      required: true,
      custom: (scope: unknown) => typeof scope === 'boolean',
      labelKey: 'procurement_scope',
    },
    projectFloorSpaceId: {
      required: (fields) => fields.isAllProject === false,
      custom: validId,
      labelKey: 'procurement_space',
    },
    supplyResponsibility: {
      required: true,
      custom: isSupplyResponsibility,
      labelKey: 'procurement_supply',
    },
    priority: { required: true, custom: isPriority, labelKey: 'procurement_priority' },
    items: { required: true, custom: Array.isArray, labelKey: 'procurement_items' },
  });
  toMap() {
    return {
      quote_id: this.quoteId,
      employee_id: this.employeeId,
      is_all_project: this.isAllProject,
      ...(this.isAllProject ? {} : { project_floor_space_id: this.projectFloorSpaceId }),
      supply_responsibility: this.supplyResponsibility,
      priority: this.priority,
      items: this.items.map((item) => item.toMap()),
    };
  }
  validate() {
    const errors = StorePurchaseRequestParams.validation.validate({
      ...this,
      projectFloorSpaceId: this.isAllProject ? null : this.projectFloorSpaceId,
    }).errors;
    this.items.forEach((item, index) =>
      errors.push(
        ...item.validate().errors.map((error) => ({
          ...error,
          field: `items.${index}.${error.field}`,
        })),
      ),
    );
    return { isValid: errors.length === 0, errors };
  }
  validateOrThrow() {
    const validation = this.validate();
    if (!validation.isValid) new ValidationError(validation.errors).openDialog();
  }
}
