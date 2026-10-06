export type PageHeaderIconKind =
  | 'person'
  | 'people'
  | 'building'
  | 'project'
  | 'truck'
  | 'box'
  | 'document'
  | 'wallet'
  | 'location'
  | 'hierarchy'
  | 'tag';

export type PageHeaderAction = 'add' | 'edit' | undefined;

const sectionIcons: Record<string, PageHeaderIconKind> = {
  admin: 'person',
  admins: 'person',
  'attachment-types': 'document',
  brand: 'tag',
  client: 'people',
  'client-source': 'hierarchy',
  'converted-projects': 'project',
  departments: 'hierarchy',
  employee: 'person',
  'execution-quotes': 'document',
  invoice: 'document',
  invoices: 'document',
  'invoice-payment': 'wallet',
  item: 'box',
  item_types: 'box',
  labor: 'person',
  location: 'location',
  'location-city': 'location',
  'location-governorate': 'location',
  material: 'box',
  measurement: 'box',
  organization: 'building',
  'organization-toggle': 'building',
  'offers-projects': 'project',
  package: 'box',
  packages: 'box',
  products: 'box',
  project: 'project',
  'project-item': 'box',
  'project-pricing': 'project',
  project_floor: 'project',
  project_preview: 'project',
  projectType: 'project',
  'quote-types': 'document',
  space: 'box',
  specialization: 'person',
  stages: 'hierarchy',
  'sub-stages': 'hierarchy',
  suppliers: 'truck',
  supply: 'box',
  'system-identity': 'building',
  term: 'document',
  terms: 'document',
  'task-assignment': 'document',
};

export function getPageHeaderIcon(path: string): PageHeaderIconKind | undefined {
  const [, section, ...remaining] = path.split('/').filter(Boolean);
  if (section === 'stages' && remaining.includes('sub-stages')) return sectionIcons['sub-stages'];
  if (section === 'contractors' && (remaining[0] === 'add' || remaining[0] === 'edit')) {
    return 'people';
  }
  return sectionIcons[section ?? ''];
}

export function getPageHeaderAction(path: string): PageHeaderAction {
  const segments = path.split('/').filter(Boolean);
  if (segments.includes('add') || segments.includes('create')) return 'add';
  if (segments.includes('edit')) return 'edit';
  return undefined;
}
