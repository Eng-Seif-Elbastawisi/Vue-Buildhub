export const DATA_MUTATION_SUCCEEDED_EVENT = 'buildhub:data-mutation-succeeded';
export const DELETE_OUTCOME_EVENT = 'buildhub:delete-outcome';

export type DeleteOutcome = { status: 'success' | 'error'; errorMessage?: string };

export const deleteSuccessMotionDuration = (): number =>
  typeof window === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ? 0
    : 380;

let activeDeleteConfirmations = 0;

export const beginDeleteConfirmation = (): (() => void) => {
  activeDeleteConfirmations += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeDeleteConfirmations -= 1;
  };
};

export const isDeleteConfirmationActive = (): boolean => activeDeleteConfirmations > 0;

export const notifyDataMutationSucceeded = (): void => {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new Event(DATA_MUTATION_SUCCEEDED_EVENT));
};

export const notifyDeleteOutcome = (outcome: DeleteOutcome): boolean => {
  if (typeof window === 'undefined') return false;

  const event = new CustomEvent<DeleteOutcome>(DELETE_OUTCOME_EVENT, {
    detail: outcome,
    cancelable: true,
  });
  window.dispatchEvent(event);
  return event.defaultPrevented;
};
