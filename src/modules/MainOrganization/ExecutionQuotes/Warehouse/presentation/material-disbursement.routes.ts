import { quotePath } from '../../Schedule/presentation/schedule.routes';

export function materialDisbursementPath(currentPath: string, quoteId: number) {
  return `${quotePath(currentPath, quoteId)}/warehouse/material-disbursement`;
}
