import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
export default class AddPackagesParams implements Params {
  public title?: string;
  public image?: string[];

  public static readonly validation = new ClassValidation().setRules({
    title: { required: true },
    image: { required: true },
    articleType: { required: true },
  });

  constructor(data: { title?: string; image?: string[] }) {
    this.title = data.title;
    this.image = data.image;
  }

  toMap(): { [p: string]: any } {
    return {
      title: this.title,
      image: this.image,
    };
  }

  validate() {
    return AddPackagesParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddPackagesParams.validation.validateOrThrow(this);
  }
}
