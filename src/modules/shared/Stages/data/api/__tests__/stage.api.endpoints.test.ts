import { describe, expect, it } from 'vitest';
import { StageEndpoints } from '../stage.api.endpoints';

describe('StageEndpoints', () => {
  it('uses dashboard stage endpoints', () => {
    const endpoints = new StageEndpoints();

    expect(endpoints.index).toContain('dashboard/index_stages');
    expect(endpoints.show).toContain('dashboard/show_stage');
    expect(endpoints.store).toContain('dashboard/store_stage');
    expect(endpoints.update).toContain('dashboard/update_stage');
    expect(endpoints.delete).toContain('dashboard/delete_stage');
  });
});
