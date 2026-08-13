import { describe, expect, it, vi } from 'vitest';
import { deleteSelectedRows } from '../deleteSelectedRows';

describe('deleteSelectedRows', () => {
  it('deletes all selected rows and refreshes the list once', async () => {
    const deleteById = vi.fn().mockResolvedValue(undefined);
    const refreshRows = vi.fn().mockResolvedValue(undefined);

    await deleteSelectedRows([{ id: 3 }, { id: 7 }], deleteById, refreshRows);

    expect(deleteById.mock.calls).toEqual([[3], [7]]);
    expect(refreshRows).toHaveBeenCalledTimes(1);
  });
});
