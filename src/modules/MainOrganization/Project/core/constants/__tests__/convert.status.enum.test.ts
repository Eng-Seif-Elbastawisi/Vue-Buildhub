import { describe, expect, it } from 'vitest';
import { ConvertStatus, getConvertStatusNameKey } from '../convert.status.enum';

describe('ConvertStatus constants', () => {
  it('returns mapped i18n keys for each status', () => {
    expect(getConvertStatusNameKey(ConvertStatus.PENDING)).toBe('project.convertStatus.pending');
    expect(getConvertStatusNameKey(ConvertStatus.CONVERT_TO_PROJECT)).toBe(
      'project.convertStatus.convertToProject',
    );
    expect(getConvertStatusNameKey(ConvertStatus.SEND_TO_CLIENT)).toBe(
      'project.convertStatus.sendToClient',
    );
    expect(getConvertStatusNameKey(ConvertStatus.REVISE_VERSION)).toBe(
      'project.convertStatus.reviseVersion',
    );
  });

  it('returns unknown for unsupported statuses', () => {
    expect(getConvertStatusNameKey(0 as ConvertStatus)).toBe('unknown');
  });
});
