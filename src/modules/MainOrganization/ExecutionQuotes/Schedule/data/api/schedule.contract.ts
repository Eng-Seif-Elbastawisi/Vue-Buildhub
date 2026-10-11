export type ScheduleOperation =
  'index' | 'show' | 'create' | 'update' | 'delete' | 'sort' | 'settings' | 'saveSettings';
// Request routes, keys, numeric duration enum and reorder are now confirmed.
export const scheduleContractGaps: Record<ScheduleOperation, readonly string[]> = {
  index: ['pagination_count_semantics', 'calculated_dates'],
  show: ['response_selection_identity', 'show_outer_envelope'],
  create: ['mutation_success_validation_errors'],
  update: ['mutation_success_validation_errors'],
  delete: ['mutation_success_errors'],
  sort: ['mutation_success_errors'],
  settings: ['missing_configuration'],
  saveSettings: ['mutation_success_validation_errors'],
};
