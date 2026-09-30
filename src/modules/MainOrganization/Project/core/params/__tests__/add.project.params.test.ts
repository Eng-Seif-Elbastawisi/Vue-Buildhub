import { describe, it, expect } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddProjectParams from '../add.project.params';
import { ServiceType } from '@/modules/MainOrganization/Project/core/constants/serviceType.enum';

describe('AddProjectParams', () => {
  it('should instantiate correctly and convert to map', () => {
    const params = new AddProjectParams({
      translations: new TranslationParams({
        title: { en: 'Project title' },
        description: { en: 'Project description' },
      }),
      client_name: 'John Doe',
      client_exist: true,
      client_id: 7,
      project_type_id: 3,
      location_id: 22,
      service_type: ServiceType.DESIGNONLY,
      date: '2026-06-24',
      terms: 'Payment terms',
      engineer_id: 15,
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
      site_link: 'https://maps.google.com/?q=30.0444,31.2357',
      address: 'Nasr City, Cairo, Egypt',
    });

    expect(params.client_name).toBe('John Doe');

    const map = params.toMap();
    expect(map.client_name).toBe('John Doe');
    expect(map.client_exist).toBe(true);
    expect(map.client_id).toBe(7);
    expect(map.project_type_id).toBe(3);
    expect(map.location_id).toBe(22);
    expect(map.service_type).toBe(ServiceType.DESIGNONLY);
    expect(map.engineer_id).toBe(15);
    expect(map.preview_date).toBe('2026-06-25');
    expect(map.preview_time).toBe('10:30:00');
    expect(map.site_link).toBe('https://maps.google.com/?q=30.0444,31.2357');
    expect(map.address).toBe('Nasr City, Cairo, Egypt');
    expect(params.validate().isValid).toBe(true);
  });

  it('requires at least one title translation', () => {
    const params = new AddProjectParams({
      translations: new TranslationParams({
        title: { en: '   ', ar: '' },
        description: { en: 'Project description' },
      }),
      client_exist: false,
      client_source: 6,
      client_name: 'John Doe',
      client_phone: '01012345678',
      project_type_id: 3,
      location_id: 22,
      service_type: ServiceType.DESIGNONLY,
      date: '2026-06-24',
      terms: 'Payment terms',
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'translations' }],
    });
  });

  it('requires at least one description translation', () => {
    const params = new AddProjectParams({
      translations: new TranslationParams({
        title: { en: 'Project title' },
        description: { en: ' ', ar: '' },
      }),
      client_exist: false,
      client_source: 6,
      client_name: 'John Doe',
      client_phone: '01012345678',
      project_type_id: 3,
      location_id: 22,
      service_type: ServiceType.DESIGNONLY,
      date: '2026-06-24',
      terms: 'Payment terms',
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'translations' }],
    });
  });

  it('requires project select values', () => {
    const params = new AddProjectParams({
      translations: new TranslationParams({
        title: { en: 'Project title' },
        description: { en: 'Project description' },
      }),
      client_exist: false,
      client_source: 6,
      client_name: 'John Doe',
      client_phone: '01012345678',
      date: '2026-06-24',
      terms: 'Payment terms',
    });

    const validation = params.validate();

    expect(validation.isValid).toBe(false);
    expect(validation.errors.map((error) => error.field)).toEqual([
      'project_type_id',
      'service_type',
      'location_id',
    ]);
  });

  it('requires client selection when creating for an existing client', () => {
    const params = new AddProjectParams({
      translations: new TranslationParams({
        title: { en: 'Project title' },
        description: { en: 'Project description' },
      }),
      client_exist: true,
      project_type_id: 3,
      location_id: 22,
      service_type: ServiceType.DESIGNONLY,
      date: '2026-06-24',
      terms: 'Payment terms',
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'client_id' }],
    });
  });

  it('requires client source when creating a new client', () => {
    const params = new AddProjectParams({
      translations: new TranslationParams({
        title: { en: 'Project title' },
        description: { en: 'Project description' },
      }),
      client_exist: false,
      client_name: 'John Doe',
      client_phone: '01012345678',
      project_type_id: 3,
      location_id: 22,
      service_type: ServiceType.DESIGNONLY,
      date: '2026-06-24',
      terms: 'Payment terms',
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'client_source' }],
    });
  });

  it('requires the request date and terms', () => {
    const params = new AddProjectParams({
      translations: new TranslationParams({
        title: { en: 'Project title' },
        description: { en: 'Project description' },
      }),
      client_exist: true,
      client_id: 7,
      project_type_id: 3,
      location_id: 22,
      service_type: ServiceType.DESIGNONLY,
    });

    expect(params.validate().errors.map((error) => error.field)).toEqual(['date', 'terms']);
  });

  it('requires valid new-client details', () => {
    const params = new AddProjectParams({
      translations: new TranslationParams({
        title: { en: 'Project title' },
        description: { en: 'Project description' },
      }),
      client_exist: false,
      client_source: 6,
      client_name: ' ',
      client_phone: 'invalid phone',
      project_type_id: 3,
      location_id: 22,
      service_type: ServiceType.DESIGNONLY,
      date: '2026-06-24',
      terms: 'Payment terms',
    });

    expect(params.validate().errors.map((error) => error.field)).toEqual([
      'client_name',
      'client_phone',
    ]);
  });

  it('rejects an attachment without its configured type', () => {
    const params = new AddProjectParams({
      translations: new TranslationParams({
        title: { en: 'Project title' },
        description: { en: 'Project description' },
      }),
      client_exist: true,
      client_id: 7,
      project_type_id: 3,
      location_id: 22,
      service_type: ServiceType.DESIGNONLY,
      date: '2026-06-24',
      terms: 'Payment terms',
      attachments: [{ file: 'data:application/pdf;base64,cGxhbg==' }],
    });

    expect(params.validate().errors.map((error) => error.field)).toEqual(['attachments']);
  });
});
