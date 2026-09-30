import { describe, it, expect } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import EditProjectParams from '../edit.project.params';
import { ServiceType } from '@/modules/MainOrganization/Project/core/constants/serviceType.enum';

describe('EditProjectParams', () => {
  it('should instantiate correctly and convert to map', () => {
    const params = new EditProjectParams({
      projectId: 123,
      translations: new TranslationParams({
        title: { en: 'Project title' },
        description: { en: 'Project description' },
      }),
      client_name: 'Jane Doe',
      project_type_id: 4,
      location_id: 30,
      service_type: ServiceType.EXECUTIONONLY,
      engineer_id: 15,
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
      site_link: 'https://maps.google.com/?q=30.0444,31.2357',
      address: 'Nasr City, Cairo, Egypt',
    });

    expect(params.projectId).toBe(123);

    const map = params.toMap();
    expect(map.project_id).toBe(123);
    expect(map.client_name).toBe('Jane Doe');
    expect(map.project_type_id).toBe(4);
    expect(map.location_id).toBe(30);
    expect(map.service_type).toBe(ServiceType.EXECUTIONONLY);
    expect(map.engineer_id).toBe(15);
    expect(map.preview_date).toBe('2026-06-25');
    expect(map.preview_time).toBe('10:30:00');
    expect(map.site_link).toBe('https://maps.google.com/?q=30.0444,31.2357');
    expect(map.address).toBe('Nasr City, Cairo, Egypt');
    expect(params.validate().isValid).toBe(true);
  });

  it('requires project id and at least one title translation', () => {
    const params = new EditProjectParams({
      translations: new TranslationParams({
        title: { en: '', ar: '   ' },
        description: { en: 'Project description' },
      }),
      project_type_id: 4,
      location_id: 30,
      service_type: ServiceType.EXECUTIONONLY,
    });

    expect(params.validate().isValid).toBe(false);
    expect(params.validate().errors.map((error) => error.field)).toEqual([
      'projectId',
      'translations',
    ]);
  });

  it('requires at least one description translation', () => {
    const params = new EditProjectParams({
      projectId: 123,
      translations: new TranslationParams({
        title: { en: 'Project title' },
        description: { en: ' ', ar: '' },
      }),
      project_type_id: 4,
      location_id: 30,
      service_type: ServiceType.EXECUTIONONLY,
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'translations' }],
    });
  });

  it('requires project select values', () => {
    const params = new EditProjectParams({
      projectId: 123,
      translations: new TranslationParams({
        title: { en: 'Project title' },
        description: { en: 'Project description' },
      }),
    });

    const validation = params.validate();

    expect(validation.isValid).toBe(false);
    expect(validation.errors.map((error) => error.field)).toEqual([
      'project_type_id',
      'service_type',
      'location_id',
    ]);
  });
});
