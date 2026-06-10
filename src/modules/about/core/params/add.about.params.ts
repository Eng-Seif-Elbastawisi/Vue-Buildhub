import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from './translation.params';
import type SocialParams from './Socail.params';

/**
 * Parameters for adding a new employee
 */
export default class AddAboutParams implements Params {
  public translation: TranslationParams;
  public images: string;
  public socialMedia: SocialParams[];

  public static readonly validation = new ClassValidation().setRules({
    translation: { required: true },
  });

  constructor(data: {
    translation: TranslationParams;
    images: string;
    socialMedia: SocialParams[];
  }) {
    this.translation = data.translation;
    this.images = data.images;
    this.socialMedia = data.socialMedia;
  }

  toMap(): { [p: string]: any } {
    return {
      translations: this.translation,
      image: `${this.images}`,
      social_links: this.socialMedia,
    };
  }

  validate() {
    return AddAboutParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddAboutParams.validation.validateOrThrow(this);
  }
}
