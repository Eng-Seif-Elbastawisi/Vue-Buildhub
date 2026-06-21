import { describe, expect, it } from 'vitest';
import flattenBranchTree from '../TreeSelectHelper';

type BranchNode = {
  id: number;
  title: string;
  subjects: never[];
  children?: BranchNode[];
};

describe('Suppliers TreeSelectHelper', () => {
  it('flattens branch leaves with parent path and root subtitle', () => {
    const result = flattenBranchTree([
      {
        id: 1,
        title: 'Root',
        subjects: [],
        children: [
          { id: 2, title: 'Child', subjects: [] },
          {
            id: 3,
            title: 'Parent',
            subjects: [],
            children: [{ id: 4, title: 'Leaf', subjects: [] }],
          },
        ],
      },
    ] as BranchNode[]);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ id: 2, title: 'Root → Child', subtitle: 1 });
    expect(result[1]).toMatchObject({ id: 4, title: 'Root → Parent → Leaf', subtitle: 1 });
  });
});
