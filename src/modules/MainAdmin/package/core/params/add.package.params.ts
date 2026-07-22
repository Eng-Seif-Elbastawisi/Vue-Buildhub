import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type { PackageModelData } from '../models/package.model';

export type AddPackageData = Omit<PackageModelData, 'id'>;

export default class AddPackageParams implements Params, AddPackageData {
  public duration: number;
  public hasmobild: boolean;
  public hasportal: boolean;
  public projectnumbers: number;
  public employeenumbers: number;
  public price: string;

  public static readonly validation = new ClassValidation().setRules({
    duration: { required: true, min: 0 },
    hasmobild: { required: true },
    hasportal: { required: true },
    projectnumbers: { required: true, min: 0 },
    employeenumbers: { required: true, min: 0 },
    price: { required: true },
  });

  constructor(packageData: AddPackageData) {
    this.duration = packageData.duration;
    this.hasmobild = packageData.hasmobild;
    this.hasportal = packageData.hasportal;
    this.projectnumbers = packageData.projectnumbers;
    this.employeenumbers = packageData.employeenumbers;
    this.price = packageData.price;
  }

  toMap(): Record<string, number | boolean | string> {
    return {
      duration: this.duration,
      hasmobild: this.hasmobild,
      hasportal: this.hasportal,
      projectnumbers: this.projectnumbers,
      employeenumbers: this.employeenumbers,
      price: this.price,
    };
  }

  validate() {
    return AddPackageParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddPackageParams.validation.validateOrThrow(this);
  }
}
