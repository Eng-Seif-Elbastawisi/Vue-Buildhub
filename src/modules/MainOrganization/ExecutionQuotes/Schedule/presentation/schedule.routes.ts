export function quotePath(currentPath: string, quoteId: number): string {
  const prefix = currentPath?.startsWith('/mainportal/') ? '/mainportal' : '/organization';
  return `${prefix}/execution-quotes/show/${quoteId}`;
}

export function schedulePath(currentPath: string, quoteId: number): string {
  return `${quotePath(currentPath, quoteId)}/schedule`;
}
