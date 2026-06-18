import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class EditSuppliersParams implements Params {
  public suppliers_id: number;
  public name: string;
  public Specialization: string;
  public phone: string;
  public materials: string;

  public static readonly validation = new ClassValidation().setRules({
    // translations: { required: true },
  });

  constructor(data: {
    suppliers_id: number;
    name: string;
    Specialization: string;
    phone: string;
    materials: string;
  }) {
    this.suppliers_id = data.suppliers_id;
    this.name = data.name;
    this.Specialization = data.Specialization;
    this.phone = data.phone;
    this.materials = data.materials;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      suppliers_id: this.suppliers_id,
      name: this.name,
      Specialization: this.Specialization,
      phone: this.phone,
      materials: this.materials,
    };

    return map;
  }

  validate() {
    return EditSuppliersParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditSuppliersParams.validation.validateOrThrow(this);
  }
}
