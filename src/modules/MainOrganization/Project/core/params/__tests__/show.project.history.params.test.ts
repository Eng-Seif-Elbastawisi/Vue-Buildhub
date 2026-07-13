import { describe, expect, it } from 'vitest';
import ShowProjectHistoryParams from '../show.project.history.params';

describe('ShowProjectHistoryParams', () => {
  it('maps project id to the API payload', () => {
    const params = new ShowProjectHistoryParams({ projectId: 27 });

    expect(params.toMap()).toEqual({ project_id: 27 });
  });

  it('requires a project id', () => {
    const result = ShowProjectHistoryParams.validation.validate({ projectId: undefined });

    expect(result.isValid).toBe(false);
  });
});
