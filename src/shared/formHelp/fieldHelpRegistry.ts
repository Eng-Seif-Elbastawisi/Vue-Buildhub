export interface FieldHelpEntry {
  titleKey: string;
  textKey: string;
  importantTitleKey?: string;
  importantTextKey?: string;
  tipKey?: string;
  icon?: string;
  exampleKeys?: readonly string[];
  aliases?: readonly string[];
}

export interface FieldHelpContent {
  title: string;
  text: string;
  importantTitle: string;
  importantText: string;
  tip: string;
  icon: string;
  examples: string[];
}

interface ResolveFieldHelpOptions {
  showHelp?: boolean;
  helpTitle?: string;
  helpText?: string;
  importantTitle?: string;
  importantText?: string;
  tip?: string;
  icon?: string;
  helpExamples?: readonly string[];
  fieldName?: string;
  fieldId?: string;
  label?: string;
  translate: (key: string, params?: Record<string, string>) => string;
}

const titleAliases = [
  'title',
  'Title',
  'title_en',
  'title_ar',
  'field_title',
  'document_title',
  'material.title',
  'supply.title',
  'item.title',
  'location.title',
  'brand.title',
  'stage_title',
  'client_source_title',
  'measurement_title',
  'project.name',
  'question title',
  'brand title',
] as const;

export const fieldHelpRegistry = {
  title: {
    titleKey: 'field_help.title.title',
    textKey: 'field_help.title.text',
    aliases: titleAliases,
  },
  title_en: {
    titleKey: 'field_help.title_en.title',
    textKey: 'field_help.title_en.text',
    aliases: ['title_en', 'Title in English'],
  },
  title_ar: {
    titleKey: 'field_help.title_ar.title',
    textKey: 'field_help.title_ar.text',
    aliases: ['title_ar', 'title_ar'],
  },
  name: {
    titleKey: 'field_help.name.title',
    textKey: 'field_help.name.text',
    importantTextKey: 'field_help.name.important',
    tipKey: 'field_help.name.tip',
    aliases: [
      'name',
      'Name',
      'employee_name',
      'admin.name',
      'client.name',
      'supplier.name',
      'system_identity.name',
      'organization-name',
      'admin-name',
      'supplier-name',
      'client_name',
    ],
  },
  description: {
    titleKey: 'field_help.description.title',
    textKey: 'field_help.description.text',
    aliases: [
      'description',
      'Description',
      'description_en',
      'description_ar',
      'field_description',
      'project.form_description',
      'site_description',
      'document_description',
    ],
  },
  price: {
    titleKey: 'field_help.price.title',
    textKey: 'field_help.price.text',
    aliases: [
      'price',
      'pricing',
      'material.price',
      'supply.price',
      'item.price',
      'project_item.price',
      'pricing-input',
    ],
  },
  duration: {
    titleKey: 'field_help.duration.title',
    textKey: 'field_help.duration.text',
    aliases: ['duration', 'duration (month only)', 'duration-input'],
  },
  date: {
    titleKey: 'field_help.date.title',
    textKey: 'field_help.date.text',
    aliases: ['date', 'start_date', 'end_date', 'preview_date', 'project.preview_date'],
  },
  time: {
    titleKey: 'field_help.time.title',
    textKey: 'field_help.time.text',
    aliases: ['time', 'preview_time', 'project.preview_time'],
  },
  status: {
    titleKey: 'field_help.status.title',
    textKey: 'field_help.status.text',
    aliases: ['status', 'item.status', 'active', 'unactive'],
  },
  type: {
    titleKey: 'field_help.type.title',
    textKey: 'field_help.type.text',
    aliases: [
      'type',
      'project.type',
      'brand.type',
      'item.type',
      'employee_type',
      'client.type',
      'document_type',
      'equipment_type',
      'location.type',
      'service_type',
    ],
  },
  image: {
    titleKey: 'field_help.image.title',
    textKey: 'field_help.image.text',
    aliases: ['image', 'flag', 'Country Flag', 'system_identity.logo', 'upload image'],
  },
  color: {
    titleKey: 'field_help.color.title',
    textKey: 'field_help.color.text',
    aliases: [
      'color',
      'primary_color',
      'secondary_color',
      'accent_color',
      'system_identity.primary_color',
      'system_identity.secondary_color',
      'system_identity.accent_color',
    ],
  },
  file: {
    titleKey: 'field_help.file.title',
    textKey: 'field_help.file.text',
    aliases: ['file', 'files', 'upload_files', 'attachments', 'upload_attachment'],
  },
  department_id: {
    titleKey: 'field_help.department.title',
    textKey: 'field_help.department.text',
    aliases: [
      'department_id',
      'department.title',
      'department name',
      'department',
      'item.department',
    ],
  },
  project_id: {
    titleKey: 'field_help.project.title',
    textKey: 'field_help.project.text',
    aliases: ['project_id', 'project', 'project_type_id', 'project.type'],
  },
  organization_id: {
    titleKey: 'field_help.organization.title',
    textKey: 'field_help.organization.text',
    aliases: ['organization_id', 'organization', 'organization-name'],
  },
  phone: {
    titleKey: 'field_help.phone.title',
    textKey: 'field_help.phone.text',
    aliases: [
      'phone',
      'Phone Number',
      'admin.phone',
      'client.phone',
      'supplier.phone',
      'employee_phone',
      'default_employee_phone',
      'client_phone',
    ],
  },
  email: {
    titleKey: 'field_help.email.title',
    textKey: 'field_help.email.text',
    aliases: [
      'email',
      'Email',
      'admin.email',
      'client.email',
      'employee_email',
      'default_employee_email',
    ],
  },
  password: {
    titleKey: 'field_help.password.title',
    textKey: 'field_help.password.text',
    aliases: ['password', 'Password', 'admin.password', 'employee_password'],
  },
  address: {
    titleKey: 'field_help.address.title',
    textKey: 'field_help.address.text',
    aliases: ['address', 'client.address', 'organization-address', 'project.preview_address_placeholder'],
  },
  code: {
    titleKey: 'field_help.code.title',
    textKey: 'field_help.code.text',
    aliases: ['code', 'Code', 'Country Code', 'location.code'],
  },
  country: {
    titleKey: 'field_help.country.title',
    textKey: 'field_help.country.text',
    aliases: ['country', 'Country', 'location.country'],
  },
  governorate: {
    titleKey: 'field_help.governorate.title',
    textKey: 'field_help.governorate.text',
    aliases: ['governorate', 'Governorate', 'location.governorate'],
  },
  city: {
    titleKey: 'field_help.city.title',
    textKey: 'field_help.city.text',
    aliases: ['city', 'City', 'location.city'],
  },
  client: {
    titleKey: 'field_help.client.title',
    textKey: 'field_help.client.text',
    aliases: ['client_id', 'client', 'Project.client_exist'],
  },
  supplier: {
    titleKey: 'field_help.supplier.title',
    textKey: 'field_help.supplier.text',
    aliases: ['supplier', 'supplier.name'],
  },
  specialization: {
    titleKey: 'field_help.specialization.title',
    textKey: 'field_help.specialization.text',
    aliases: ['specialization', 'supplier.specialization'],
  },
  material: {
    titleKey: 'field_help.material.title',
    textKey: 'field_help.material.text',
    aliases: ['material', 'supplier.materials', 'project_item.item', 'item'],
  },
  brand: {
    titleKey: 'field_help.brand.title',
    textKey: 'field_help.brand.text',
    aliases: ['brand', 'material.brand', 'supply.brand'],
  },
  measurement: {
    titleKey: 'field_help.measurement.title',
    textKey: 'field_help.measurement.text',
    aliases: ['measurement', 'item.measurement', 'material.unit', 'supply.unit'],
  },
  stage: {
    titleKey: 'field_help.stage.title',
    textKey: 'field_help.stage.text',
    aliases: ['stage', 'stage_id', 'item.stage', 'select_stage'],
  },
  floor_number: {
    titleKey: 'field_help.floor_number.title',
    textKey: 'field_help.floor_number.text',
    aliases: ['floor_number', 'ProjectFloor.floor_number', 'project_item.project_floor'],
  },
  space: {
    titleKey: 'field_help.space.title',
    textKey: 'field_help.space.text',
    aliases: ['space', 'space_id', 'ProjectFloor.space'],
  },
  quantity: {
    titleKey: 'field_help.quantity.title',
    textKey: 'field_help.quantity.text',
    aliases: ['quantity', 'project_item.quantity'],
  },
  total: {
    titleKey: 'field_help.total.title',
    textKey: 'field_help.total.text',
    aliases: ['total', 'project_item.total_label', 'project_item.total_price_label'],
  },
  notes: {
    titleKey: 'field_help.notes.title',
    textKey: 'field_help.notes.text',
    aliases: ['notes', 'item.notes', 'technical_general_notes', 'inspection_recommendations'],
  },
  engineer: {
    titleKey: 'field_help.engineer.title',
    textKey: 'field_help.engineer.text',
    aliases: ['engineer', 'engineer_id', 'project.preview_engineer'],
  },
  site_link: {
    titleKey: 'field_help.site_link.title',
    textKey: 'field_help.site_link.text',
    aliases: ['site_link', 'project.site_link'],
  },
  tax: {
    titleKey: 'field_help.tax.title',
    textKey: 'field_help.tax.text',
    aliases: ['tax', 'total_tax', 'project_pricing.total_tax'],
  },
  discount: {
    titleKey: 'field_help.discount.title',
    textKey: 'field_help.discount.text',
    aliases: ['discount', 'discount_type', 'discount_value', 'project_pricing.discount_type'],
  },
} as const satisfies Record<string, FieldHelpEntry>;

const aliasToKey = new Map<string, keyof typeof fieldHelpRegistry>();

Object.entries(fieldHelpRegistry).forEach(([key, entry]) => {
  aliasToKey.set(normalizeFieldHelpKey(key), key as keyof typeof fieldHelpRegistry);

  entry.aliases?.forEach((alias) => {
    aliasToKey.set(normalizeFieldHelpKey(alias), key as keyof typeof fieldHelpRegistry);
  });
});

export function normalizeFieldHelpKey(value?: string | null): string {
  if (!value) return '';

  return value
    .trim()
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[`'"]/g, '')
    .replace(/[\s./:-]+/g, '_')
    .replace(/[^a-z0-9_\u0600-\u06ff]+/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export function resolveFieldHelpContent({
  showHelp = true,
  helpTitle,
  helpText,
  importantTitle,
  importantText,
  tip,
  icon,
  helpExamples,
  fieldName,
  fieldId,
  label,
  translate,
}: ResolveFieldHelpOptions): FieldHelpContent | null {
  if (!showHelp) return null;

  const explicitExamples = [...(helpExamples ?? [])].filter(Boolean);

  if (helpTitle || helpText || importantText || tip || explicitExamples.length) {
    const title = helpTitle || label || translate('field_help.default_title');

    return {
      title,
      text: helpText || '',
      importantTitle: importantTitle || translate('field_help.important_title'),
      importantText:
        importantText ||
        translate('field_help.default_importance', {
          field: title,
        }),
      tip: tip || '',
      icon: icon || 'pi pi-info-circle',
      examples: explicitExamples,
    };
  }

  const entry = findRegistryEntry([fieldName, fieldId, label], translate);

  if (!entry) return null;

  return {
    title: translate(entry.titleKey),
    text: translate(entry.textKey),
    importantTitle: entry.importantTitleKey
      ? translate(entry.importantTitleKey)
      : translate('field_help.important_title'),
    importantText: entry.importantTextKey
      ? translate(entry.importantTextKey)
      : translate('field_help.default_importance', {
          field: translate(entry.titleKey),
        }),
    tip: entry.tipKey ? translate(entry.tipKey) : '',
    icon: entry.icon || 'pi pi-info-circle',
    examples: entry.exampleKeys?.map((key) => translate(key)) ?? [],
  };
}

function findRegistryEntry(
  candidates: readonly (string | undefined)[],
  translate: (key: string, params?: Record<string, string>) => string,
): FieldHelpEntry | null {
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeFieldHelpKey(candidate);

    if (!normalizedCandidate) continue;

    const directKey = aliasToKey.get(normalizedCandidate);

    if (directKey) return fieldHelpRegistry[directKey];
  }

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeFieldHelpKey(candidate);

    if (!normalizedCandidate) continue;

    for (const [entryKey, entry] of Object.entries(fieldHelpRegistry)) {
      const localizedAliases = entry.aliases?.map((alias) => translate(alias)) ?? [];

      if (localizedAliases.some((alias) => normalizeFieldHelpKey(alias) === normalizedCandidate)) {
        return fieldHelpRegistry[entryKey as keyof typeof fieldHelpRegistry];
      }
    }
  }

  return null;
}
