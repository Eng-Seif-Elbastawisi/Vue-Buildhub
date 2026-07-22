import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type { AddPackageData } from './add.package.params';

export default class EditPackageParams implements Params, AddPackageData {
  public id: number;
  public duration: number;
  public hasmobild: boolean;
  public hasportal: boolean;
  public projectnumbers: number;
  public employeenumbers: number;
  public price: string;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
    duration: { required: true, min: 0 },
    hasmobild: { required: true },
    hasportal: { required: true },
    projectnumbers: { required: true, min: 0 },
    employeenumbers: { required: true, min: 0 },
    price: { required: true },
  });

  constructor(packageData: AddPackageData & { id: number }) {
    this.id = packageData.id;
    this.duration = packageData.duration;
    this.hasmobild = packageData.hasmobild;
    this.hasportal = packageData.hasportal;
    this.projectnumbers = packageData.projectnumbers;
    this.employeenumbers = packageData.employeenumbers;
    this.price = packageData.price;
  }

  toMap(): Record<string, number | boolean | string> {
    return {
      package_id: this.id,
      duration: this.duration,
      hasmobild: this.hasmobild,
      hasportal: this.hasportal,
      projectnumbers: this.projectnumbers,
      employeenumbers: this.employeenumbers,
      price: this.price,
    };
  }

  validate() {
    return EditPackageParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditPackageParams.validation.validateOrThrow(this);
  }
}
