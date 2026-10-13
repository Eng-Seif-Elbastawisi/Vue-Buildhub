import { quotePath } from '../../Schedule/presentation/schedule.routes';
export function procurementPath(currentPath: string, quoteId: number) {
  return `${quotePath(currentPath, quoteId)}/procurement`;
}
