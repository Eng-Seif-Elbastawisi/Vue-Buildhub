import { describe, it, expect } from 'vitest';
import AboutModel from '../about.model';
import SocialModel from '../social.model';
import TranslationModel from '../translation.model';

const makeTranslation = () =>
  new TranslationModel({
    title: { ar: 'العنوان', en: 'Title' },
    description: { ar: 'الوصف', en: 'Description' },
  });

const makeSocialMedia = () => [
  new SocialModel({ link: 'https://facebook.com', icon: 'facebook.png' }),
  new SocialModel({ link: 'https://x.com', icon: 'x.png' }),
];

describe('AboutModel', () => {
  describe('constructor', () => {
    it('should create an instance with all provided fields', () => {
      const translations = makeTranslation();
      const socialMedia = makeSocialMedia();

      const model = new AboutModel({
        id: 42,
        translations,
        images: 'header.jpg',
        socialMedia,
      });

      expect(model.id).toBe(42);
      expect(model.translations).toBe(translations);
      expect(model.images).toBe('header.jpg');
      expect(model.socialMedia).toEqual(socialMedia);
    });

    it('should allow id to be undefined', () => {
      const model = new AboutModel({
        translations: makeTranslation(),
        images: 'img.jpg',
        socialMedia: [],
      });

      expect(model.id).toBeUndefined();
    });

    it('should accept an empty socialMedia array', () => {
      const model = new AboutModel({
        id: 1,
        translations: makeTranslation(),
        images: 'img.jpg',
        socialMedia: [],
      });

      expect(model.socialMedia).toEqual([]);
    });
  });

  describe('immutability', () => {
    it('should be frozen after construction', () => {
      const model = new AboutModel({
        id: 1,
        translations: makeTranslation(),
        images: 'img.jpg',
        socialMedia: [],
      });

      expect(Object.isFrozen(model)).toBe(true);
    });

    it('should not allow property mutation', () => {
      const model = new AboutModel({
        id: 1,
        translations: makeTranslation(),
        images: 'img.jpg',
        socialMedia: [],
      });

      expect(() => {
        (model as any).id = 99;
      }).toThrow();
    });
  });

  describe('fromJson', () => {
    it('should throw when json is null', () => {
      expect(() => AboutModel.fromJson(null)).toThrow(
        'Cannot create EmployeeModel from null or undefined',
      );
    });

    it('should throw when json is undefined', () => {
      expect(() => AboutModel.fromJson(undefined)).toThrow(
        'Cannot create EmployeeModel from null or undefined',
      );
    });
  });

  describe('static example', () => {
    it('should be a valid AboutModel instance', () => {
      expect(AboutModel.example).toBeInstanceOf(AboutModel);
    });

    it('should have an id of 1', () => {
      expect(AboutModel.example.id).toBe(1);
    });

    it('should have 3 social media entries', () => {
      expect(AboutModel.example.socialMedia).toHaveLength(3);
    });

    it('should be frozen', () => {
      expect(Object.isFrozen(AboutModel.example)).toBe(true);
    });
  });
});
