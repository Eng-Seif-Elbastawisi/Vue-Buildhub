export const EmployeeStatusEnm = {
  active: 1,
  disavtive: 2,
} as const;

export type EmployeeStatusEnm = (typeof EmployeeStatusEnm)[keyof typeof EmployeeStatusEnm];
