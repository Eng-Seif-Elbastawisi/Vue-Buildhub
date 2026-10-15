import { quotePath } from '../../Schedule/presentation/schedule.routes';
export function materialReceiptPath(currentPath: string, quoteId: number) {
  return `${quotePath(currentPath, quoteId)}/warehouse/material-receipt`;
}
