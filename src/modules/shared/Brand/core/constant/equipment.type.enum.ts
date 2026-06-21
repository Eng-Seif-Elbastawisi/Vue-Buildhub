export const EquipmentTypeEnum = {
  materials: 1,
  equipment: 2,
  services: 3,
} as const;

export type EquipmentTypeEnum = (typeof EquipmentTypeEnum)[keyof typeof EquipmentTypeEnum];
