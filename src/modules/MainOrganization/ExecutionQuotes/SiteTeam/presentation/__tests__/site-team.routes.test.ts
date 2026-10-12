import { expect, it } from 'vitest';
import { siteTeamPath } from '../site-team.routes';
import { schedulePath } from '../../../Schedule/presentation/schedule.routes';
it.each(['/organization', '/mainportal'])(
  'keeps Site & Team and Schedule within %s Quote context',
  (prefix) => {
    expect(siteTeamPath(`${prefix}/execution-quotes/show/140`, 140)).toBe(
      `${prefix}/execution-quotes/show/140/site-team`,
    );
    expect(schedulePath(`${prefix}/execution-quotes/show/140`, 140)).toBe(
      `${prefix}/execution-quotes/show/140/schedule`,
    );
  },
);
