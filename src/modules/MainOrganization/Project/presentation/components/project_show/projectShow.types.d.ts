import type { ConvertStatus } from '../../../core/constants/convert.status.enum';

export type LocaleEntry = {
  locale?: string;
  title?: string | null;
  description?: string | null;
};

export type NamedEntity = {
  id?: number;
  name?: string | null;
  title?: string | LocaleEntry[] | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  parent?: NamedEntity | null;
};

export type Attachment = {
  id?: number;
  file?: string;
  alt?: string | null;
  file_size?: string | null;
  type?: string | number | null;
};

export type FloorSpace = {
  id?: number;
  space?: NamedEntity | null;
  length?: string | number | null;
  width?: string | number | null;
  height?: string | number | null;
  notes?: string | null;
  attachments?: Attachment[];
  parentFloorNumber?: number | null;
};

export type ProjectPreview = {
  id?: number;
  engineer?: NamedEntity | null;
  pricing_responsible?: NamedEntity | null;
  notification_type?: number | string | null;
  notification_message?: string | null;
  preview_date?: string | null;
  preview_time?: string | null;
  site_link?: string | null;
  address?: string | null;
};

export type ProjectFloor = {
  id?: number;
  floor_number?: number | null;
  status?: number | null;
  project_preview?: ProjectPreview | null;
  spaces?: FloorSpace[];
  created_at?: string | null;
};

export type ProjectDepartmentItemRow = {
  id?: number;
  uuid?: string;
  item?: NamedEntity | null;
  quantity?: string | number | null;
  price?: string | number | null;
  final_price?: string | number | null;
  pricing_method?: number | null;
  project_floor_id?: string | number | null;
  project_floor_space_id?: string | number | null;
  created_at?: string | null;
};

export type ProjectDepartmentRow = {
  id?: number;
  department?: NamedEntity | null;
  items?: ProjectDepartmentItemRow[];
  created_at?: string | null;
};

export type ProjectPricingRow = {
  id?: number;
  total_tax?: string | number | null;
  discount_type?: number | null;
  discount_value?: string | number | null;
  price_after_discount?: string | number | null;
  created_at?: string | null;
};

export type ProjectShowRaw = {
  id?: number;
  convert_status?: ConvertStatus | number | null;
  organization?: NamedEntity | null;
  employee?: NamedEntity | null;
  client?: NamedEntity | null;
  project_type?: NamedEntity | null;
  location?: NamedEntity | null;
  service_type?: number | null;
  status?: ConvertStatus | number | null;
  title?: string | LocaleEntry[] | null;
  description?: LocaleEntry[] | null;
  date?: string | null;
  parent_id?: number | null;
  notes?: string | null;
  site_description?: string | null;
  technical_general_notes?: string | null;
  inspection_recommendations?: string | null;
  expected_design_duration?: string | number | null;
  payment_method?: string | number | null;
  allowed_revision_count?: string | number | null;
  selected_version?: string | number | null;
  project_floors?: ProjectFloor[];
  project_floor_spaces?: FloorSpace[];
  project_departments?: ProjectDepartmentRow[];
  project_department_items?: unknown[];
  project_pricing?: ProjectPricingRow | null;
  attachments?: Attachment[];
  created_at?: string | null;
};

export type TabItem = {
  id: string;
  label: string;
  icon: string;
};

export type StatusMeta = {
  label: string;
  className: string;
};

export type ProjectInfoItem = {
  icon: string;
  label: string;
  value: string;
  meta?: string;
  badge?: string;
};

export type ProjectStatItem = {
  icon: string;
  value: string;
  label: string;
};

export type ProjectItemRow = {
  id?: number;
  title?: string;
};
