import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { requiredSelectRule } from '@/base/Presentation/Utils/input_title';

/**
 * Parameters for adding a new employee
 */
export default class AddLaborParams implements Params {
  public title: string;
  public price: number;
  public brandId: number;
  public measurementUnitId: number;
  public subStageId: number;
  public stageId: number;

  public static readonly validation = new ClassValidation().setRules({
    title: { required: true, minLength: 2, maxLength: 100 },
    price: { required: true },
    brandId: { required: true },
    measurementUnitId: { required: true },
    subStageId: { required: true },
    stageId: { required: true },
  });

  constructor(data: {
    title: string;
    price: number;
    brandId: number;
    measurementUnitId: number;
    subStageId: number;
    stageId: number;
  }) {
    this.title = data.title;
    this.price = data.price;
    this.brandId = data.brandId;
    this.measurementUnitId = data.measurementUnitId;
    this.subStageId = data.subStageId;
    this.stageId = data.stageId;
  }

  toMap(): { [p: string]: any } {
    return {
      title: this.title,
      price: this.price,
      brand_id: this.brandId,
      measurement_unit_id: this.measurementUnitId,
      sub_stage_id: this.subStageId,
      stage_id: this.stageId,
    };
  }

  validate() {
    return AddEmployeeParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddEmployeeParams.validation.validateOrThrow(this);
  }
}
