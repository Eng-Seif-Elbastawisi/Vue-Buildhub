export const DATA_MUTATION_SUCCEEDED_EVENT = 'buildhub:data-mutation-succeeded';

export const notifyDataMutationSucceeded = (): void => {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new Event(DATA_MUTATION_SUCCEEDED_EVENT));
};
