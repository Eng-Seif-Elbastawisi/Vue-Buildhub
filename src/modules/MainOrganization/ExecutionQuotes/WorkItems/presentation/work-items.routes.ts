import { quotePath } from '../../Schedule/presentation/schedule.routes';
export function workItemsPath(currentPath: string, quoteId: number) {
  return `${quotePath(currentPath, quoteId)}/work-items`;
}
