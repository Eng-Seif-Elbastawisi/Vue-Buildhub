import { describe, expect, it } from 'vitest';
import router from './index';

describe('dashboard route prefixes', () => {
  it.each([
    ['/organization/project/add', 'add-project'],
    ['/organization/project_preview/add', 'add-project_preview'],
    ['/organization/project_floor/add', 'add-project_floor'],
    ['/mainportal/project/add', 'add-project'],
    ['/mainportal/project_preview/add', 'add-project_preview'],
    ['/mainportal/project_floor/add', 'add-project_floor'],
  ])('resolves %s to %s', (path, routeName) => {
    expect(router.resolve(path).name).toBe(routeName);
  });
});
