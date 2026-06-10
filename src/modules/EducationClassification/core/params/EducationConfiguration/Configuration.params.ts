import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '../translation.params';

/**
 * Parameters for adding a new country
 */
export default class ConfigurationParams implements Params {
  levelNumber: number;
  translation: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    levelNumber: { required: true },
  });

  constructor(data: { levelNumber: number; translation: TranslationParams }) {
    this.levelNumber = data.levelNumber;
    this.translation = data.translation;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      level_number: this.levelNumber,
      translations: this.translation.toMap(),
    };
    return map;
  }

  validate() {
    return ConfigurationParams.validation.validate(this);
  }

  validateOrThrow() {
    return ConfigurationParams.validation.validateOrThrow(this);
  }
}
