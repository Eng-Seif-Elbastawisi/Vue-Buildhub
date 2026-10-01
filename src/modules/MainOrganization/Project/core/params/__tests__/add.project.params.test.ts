import { describe, it, expect } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddProjectParams from '../add.project.params';
import { ServiceType } from '@/modules/MainOrganization/Project/core/constants/serviceType.enum';

describe('AddProjectParams', () => {
  it('should instantiate correctly and convert to map', () => {
    const params = new AddProjectParams({
      translations: new TranslationParams({ title: { en: 'Project title' } }),
      client_name: 'John Doe',
      client_exist: true,
      client_id: 7,
      project_type_id: 3,
      location_id: 22,
      service_type: ServiceType.DESIGNONLY,
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
      translations: new TranslationParams({ title: { en: '   ', ar: '' } }),
      client_exist: false,
      client_source: 6,
      project_type_id: 3,
      location_id: 22,
      service_type: ServiceType.DESIGNONLY,
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'translations' }],
    });
  });

  it('requires project select values', () => {
    const params = new AddProjectParams({
      translations: new TranslationParams({ title: { en: 'Project title' } }),
      client_exist: false,
      client_source: 6,
    });

    const validation = params.validate();

    expect(validation.isValid).toBe(false);
    expect(validation.errors.map((error) => error.field)).toEqual([
      'project_type_id',
      'location_id',
      'service_type',
    ]);
  });

  it('requires client selection when creating for an existing client', () => {
    const params = new AddProjectParams({
      translations: new TranslationParams({ title: { en: 'Project title' } }),
      client_exist: true,
      project_type_id: 3,
      location_id: 22,
      service_type: ServiceType.DESIGNONLY,
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'client_id' }],
    });
  });

  it('requires client source when creating a new client', () => {
    const params = new AddProjectParams({
      translations: new TranslationParams({ title: { en: 'Project title' } }),
      client_exist: false,
      project_type_id: 3,
      location_id: 22,
      service_type: ServiceType.DESIGNONLY,
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'client_source' }],
    });
  });

  it('groups attachments by type in the files payload', () => {
    const params = new AddProjectParams({
      attachments: [
        {
          file: 'data:image/png;base64,front',
          attachment_type_id: 5,
          alt: 'Front view',
        },
        {
          file: 'data:image/jpeg;base64,side',
          attachment_type_id: 5,
          alt: 'Side view',
        },
        {
          file: 'data:application/pdf;base64,contract',
          attachment_type_id: 2,
          name: 'Contract',
        },
      ],
    });

    expect(params.toMap().files).toEqual([
      {
        attachment_type_id: 5,
        attachments: [
          { file: 'data:image/png;base64,front', alt: 'Front view', link: null },
          { file: 'data:image/jpeg;base64,side', alt: 'Side view', link: null },
        ],
      },
      {
        attachment_type_id: 2,
        attachments: [
          { file: 'data:application/pdf;base64,contract', alt: 'Contract', link: null },
        ],
      },
    ]);
    expect(params.toMap()).not.toHaveProperty('attachments');
  });

  it('rejects an attachment without an attachment type', () => {
    const params = new AddProjectParams({
      attachments: [{ file: 'data:image/png;base64,front' }],
    });

    expect(params.validate().errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'attachments' })]),
    );
    expect(() => params.toMap()).toThrow('attachment_type_id is required');
  });
});
