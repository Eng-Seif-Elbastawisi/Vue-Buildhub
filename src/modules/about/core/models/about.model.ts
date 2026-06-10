import SocialModel from './social.model';
import Image from '@/assets/images/FeatureHeader.jpg';
import Facebook from '@/assets/images/SocialLinks/facebook.png';
import x from '@/assets/images/SocialLinks/x.png';
import instagram from '@/assets/images/SocialLinks/instagram.png';

/**
 * Employee model representing an employee entity
 */
export default class AboutModel {
  public readonly id?: number;
  public readonly translations: {
    title: Record<string, string>;
    description: Record<string, string>;
  };
  public readonly images: string;
  public readonly socialMedia: SocialModel[];

  constructor(data: {
    id?: number;
    translations: {
      title: Record<string, string>;
      description: Record<string, string>;
    };
    images: string;
    socialMedia: SocialModel[];
  }) {
    this.id = data.id;
    this.translations = data.translations;
    this.images = data.images;
    this.socialMedia = data.socialMedia;

    Object.freeze(this);
  }

  /**
   * Create AboutModel from API response
   * @param json - Raw JSON data from API
   * @returns AboutModel instance
   */
  static fromJson(json: any): AboutModel {
    if (!json) {
      throw new Error('Cannot create AboutModel from null or undefined');
    }

    const mapTranslations = (translations: any[], key: string = 'value') => {
      const result: Record<string, string> = {};
      if (Array.isArray(translations)) {
        translations.forEach((t: any) => {
          if (t.locale && t[key]) {
            result[t.locale] = t[key];
          }
        });
      }
      return result;
    };

    return new AboutModel({
      id: json.id,
      translations: {
        title: mapTranslations(json.titles, 'title'),
        description: mapTranslations(json.description, 'description'),
      },
      images: json.image,
      socialMedia: (json.social_links || []).map((el: any) => SocialModel.fromJson(el)),
    });
  }

  static example: AboutModel = new AboutModel({
    id: 1,
    translations: {
      title: {
        ar: 'منصة التعلم الذكي',
        en: 'Smart Learning Platform',
      },
      description: {
        ar: 'وصف منصة التعلم الذكي',
        en: 'Smart Learning Platform description',
      },
    },
    images: Image,
    socialMedia: [
      new SocialModel({
        link: 'social/insta',
        icon: instagram,
      }),
      new SocialModel({
        link: 'social/face',
        icon: Facebook,
      }),
      new SocialModel({
        link: 'social/x',
        icon: x,
      }),
    ],
  });
}
