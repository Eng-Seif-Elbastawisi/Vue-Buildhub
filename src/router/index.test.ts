import { describe, expect, it } from 'vitest';
import router from './index';

describe('dashboard route prefixes', () => {
  it.each([
    ['dashboard', '/admin'],
    ['Organization App', '/organization'],
  ])('resolves the %s Home route to %s', (name, path) => {
    expect(router.resolve({ name }).path).toBe(path);
  });

  it.each([
    ['/organization/project/add', 'add-project'],
    ['/organization/project_preview/add', 'add-project_preview'],
    ['/organization/project_floor/add', 'add-project_floor'],
    ['/organization/task-assignment', 'mainorganization-task-assignment-index'],
    ['/organization/task-assignment/create', 'mainorganization-task-assignment-create'],
    ['/mainportal/project/add', 'add-project'],
    ['/mainportal/project_preview/add', 'add-project_preview'],
    ['/mainportal/project_floor/add', 'add-project_floor'],
    ['/mainportal/task-assignment', 'mainorganization-task-assignment-index'],
    ['/mainportal/task-assignment/create', 'mainorganization-task-assignment-create'],
  ])('resolves %s to %s', (path, routeName) => {
    expect(router.resolve(path).name).toBe(routeName);
  });

  it.each([
    ['/organization/project/show/24/price-percentage', 'project-price-percentage'],
    ['/mainportal/project/show/24/price-percentage', 'project-price-percentage'],
  ])('resolves price percentage settings at %s', (path, routeName) => {
    expect(router.resolve(path).name).toBe(routeName);
  });

  it.each([
    ['/organization/project/show/30/invoice-action/add', 'project-invoice-action-add'],
    ['/mainportal/project/show/30/invoice-action/add', 'project-invoice-action-add'],
  ])('resolves invoice action creation at %s', (path, routeName) => {
    expect(router.resolve(path).name).toBe(routeName);
  });
});
