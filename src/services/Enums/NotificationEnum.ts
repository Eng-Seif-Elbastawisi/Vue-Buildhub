

export const NotificationEnum = {
  ZONE : 1,
  MACHINE : 2,
  EMPLOYEE : 3,
  ObservationType : 4,
  HazardType : 5,
  AccidentsType : 6,
  WAREHOUSE : 7,
  PROJECTLOCATION : 8,
  PROJECTZONE : 9,
  EQUIPMENT : 10,
  PROJECT : 11,
  OBSERVATION : 12,
  TASK : 13,
  CONTRACTOR : 14,
  CERTIFICATE : 15,
  TASKRESULTITEMANSWER : 16,
  INCIDENT : 17,
} as const;

export type NotificationEnum = (typeof NotificationEnum)[keyof typeof NotificationEnum];
