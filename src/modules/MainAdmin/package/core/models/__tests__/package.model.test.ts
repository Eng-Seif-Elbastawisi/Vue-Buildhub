import { describe, expect, it } from 'vitest';
import PackageModel from '../package.model';

describe('PackageModel', () => {
  it('maps API values while preserving package field names', () => {
    const packageData = PackageModel.fromJson({
      package_id: 4,
      duration: '12',
      hasmobild: 1,
      hasportal: 'false',
      projectnumbers: '10',
      employeenumbers: 25,
      price: 999,
    });

    expect(packageData).toEqual(
      expect.objectContaining({
        id: 4,
        duration: 12,
        hasmobild: true,
        hasportal: false,
        projectnumbers: 10,
        employeenumbers: 25,
        price: '999',
      }),
    );
  });

  it.each([null, {}, { ...PackageModel.example, duration: 'invalid' }])(
    'rejects malformed API data: %j',
    (rawPackage) => {
      expect(() => PackageModel.fromJson(rawPackage)).toThrow();
    },
  );
});
