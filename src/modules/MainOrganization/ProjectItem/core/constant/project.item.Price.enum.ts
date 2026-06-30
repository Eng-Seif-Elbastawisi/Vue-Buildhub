export const ProjectItemPriceEnum = {
  GENERAL_ITEM: 1,
  SPACE_RELATED: 2,
  FULL_FLOOR_RELATED: 3,
} as const;

export type ProjectItemPriceEnum = (typeof ProjectItemPriceEnum)[keyof typeof ProjectItemPriceEnum];
