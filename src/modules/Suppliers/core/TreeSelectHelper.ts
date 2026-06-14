import TitleInterface from '@/base/Data/Models/titleInterface';
import type BranchesModel from '@/modules/Stages/core/models/branches.model';

function flattenBranchTree(
  nodes: BranchesModel[],
  parentTitle: string = '',
  rootId?: number,
): TitleInterface<number>[] {
    
  return nodes.flatMap((node) => {
    const currentTitle = parentTitle ? `${parentTitle} → ${node.title}` : node.title;
    const currentRootId = rootId ?? node.id;

    if (!node.children || node.children.length === 0) {
      return [
        new TitleInterface<number>({
          id: node.id!,
          title: currentTitle,
          subtitle: currentRootId, 
        }),
      ];
    }

    return flattenBranchTree(node.children, currentTitle, currentRootId);
  });
}

export default flattenBranchTree;
