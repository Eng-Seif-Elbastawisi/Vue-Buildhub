
import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
export default class DeleteFaqsParams implements Params {
  public id: number;

  public static readonly validation = new ClassValidation().setRules({ id: { required: true } });

  constructor(data: { id: number }) {
    this.id = data.id;
  }

  toMap(): { [p: string]: any } {
    return { faq_id: this.id };
  }


  validate() {
    return DeleteFaqsParams.validation.validate(this);
  }
  validateOrThrow() {
    return DeleteFaqsParams.validation.validateOrThrow(this);
  }

}
