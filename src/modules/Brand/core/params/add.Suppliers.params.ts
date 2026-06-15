import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class AddSuppliersParams implements Params {
  public name?: string;
  public Specialization?: string;
  public phone?: string;
  public materials?: string;
  public static readonly validation = new ClassValidation().setRules({
    name: { required: false },
    Specialization: { required: false },
    phone: { required: false },
    materials: { required: false },
  });
  constructor(data: {
    name?: string;
    Specialization?: string;
    phone?: string;
    materials?: string;
  }) {
    this.name = data.name;
    this.Specialization = data.Specialization;
    this.phone = data.phone;
    this.materials = data.materials;
  }
  toMap(): { [p: string]: any } {
    return {
      name: this.name,
      Specialization: this.Specialization,
      phone: this.phone,
      materials: this.materials,
    };
  }
  validate() {
    return AddSuppliersParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddSuppliersParams.validation.validateOrThrow(this);
  }
}
