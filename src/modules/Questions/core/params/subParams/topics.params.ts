import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class TopicsParams implements Params {
  public id?: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
  });

  constructor(data: { id?: number }) {
    this.id = data.id;
  }

  toMap(): { [p: string]: any } {
    return {
      e_c_s_topic_id: this.id,
    };
  }

  validate() {
    return TopicsParams.validation.validate(this);
  }

  validateOrThrow() {
    return TopicsParams.validation.validateOrThrow(this);
  }
}
