import { quotePath } from '../../Schedule/presentation/schedule.routes';
export function siteTeamPath(currentPath: string, quoteId: number): string {
  return `${quotePath(currentPath, quoteId)}/site-team`;
}
