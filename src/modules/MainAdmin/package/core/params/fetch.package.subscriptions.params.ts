import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class FetchPackageSubscriptionsParams implements Params {
  public readonly word: string;

  public static readonly validation = new ClassValidation();

  constructor(data: { word?: string } = {}) {
    this.word = data.word?.trim() ?? '';
  }

  public toMap(): Record<string, string> {
    if (!this.word) {
      return {};
    }

    return {
      word: this.word,
    };
  }

  public validate() {
    return FetchPackageSubscriptionsParams.validation.validate(this);
  }

  public validateOrThrow() {
    return FetchPackageSubscriptionsParams.validation.validateOrThrow(this);
  }
}
