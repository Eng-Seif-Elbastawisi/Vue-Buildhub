export const validationEnum = {
  INLINE: "inline",
  DIALOG: "dialog",
  BOTH: "both",
} as const;

export type validationEnum = (typeof validationEnum)[keyof typeof validationEnum];
