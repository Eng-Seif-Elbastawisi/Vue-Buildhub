export const ItemTypeEnum = {
  MANUFACTURING: 1,
  MATERIAL: 2,
  MATERIAL_MANUFACTURING: 3,
  SUPPLY_INSTALLATION: 4,
} as const;

export type ItemTypeEnum = (typeof ItemTypeEnum)[keyof typeof ItemTypeEnum];
