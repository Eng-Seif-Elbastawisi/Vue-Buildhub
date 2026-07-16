import { describe, expect, it } from 'vitest';
import { ItemServiceTypeEnum } from '../../../core/constant/item.service.type.enum';
import { getItemServiceTypeFromQuery, getItemServiceTypeQuery } from '../itemRouteServiceType';

describe('itemRouteServiceType', () => {
  it('reads valid service type values from route query values', () => {
    expect(getItemServiceTypeFromQuery(String(ItemServiceTypeEnum.DESIGN))).toBe(
      ItemServiceTypeEnum.DESIGN,
    );
    expect(getItemServiceTypeFromQuery([String(ItemServiceTypeEnum.SUPERVISION)])).toBe(
      ItemServiceTypeEnum.SUPERVISION,
    );
  });

  it('ignores missing or unsupported service type query values', () => {
    expect(getItemServiceTypeFromQuery(undefined)).toBeUndefined();
    expect(getItemServiceTypeFromQuery('99')).toBeUndefined();
  });

  it('builds a route query only when service type is valid', () => {
    expect(getItemServiceTypeQuery(String(ItemServiceTypeEnum.BOTH))).toEqual({
      service_type: String(ItemServiceTypeEnum.BOTH),
    });
    expect(getItemServiceTypeQuery('invalid')).toEqual({});
  });
});
