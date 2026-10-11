import { describe, expect, it } from 'vitest';
import { getPageHeaderAction, getPageHeaderIcon } from '../pageHeaderIcon';

describe('page header icon routing', () => {
  it.each([
    ['/organization/employee/add', 'person', 'add'],
    ['/organization/client/edit/12', 'people', 'edit'],
    ['/organization/project/show/5', 'project', undefined],
    ['/organization/execution-quotes/add/stages/2', 'document', 'add'],
    ['/admin/client-source/add', 'hierarchy', 'add'],
    ['/organization/stages/3/sub-stages/edit/4', 'hierarchy', 'edit'],
    ['/organization/invoice-payment', 'wallet', undefined],
    ['/organization/location-city/add', 'location', 'add'],
    ['/organization/contractors/add', 'people', 'add'],
    ['/organization/contractors/edit/9', 'people', 'edit'],
    ['/organization/warehouse/add', 'box', 'add'],
  ])('maps %s to its entity and action', (path, icon, action) => {
    expect(getPageHeaderIcon(path)).toBe(icon);
    expect(getPageHeaderAction(path)).toBe(action);
  });

  it('leaves unrelated routes without an icon or action', () => {
    expect(getPageHeaderIcon('/organization/settings')).toBeUndefined();
    expect(getPageHeaderAction('/organization/settings')).toBeUndefined();
  });
});
