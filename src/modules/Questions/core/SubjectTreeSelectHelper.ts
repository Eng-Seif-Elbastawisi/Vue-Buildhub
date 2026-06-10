import TitleInterface from '@/base/Data/Models/titleInterface';
import StageModel from '@/modules/Stages/core/models/stage.model';

function flattenSubjectBranchTree(nodes: StageModel[]): TitleInterface<number>[] {
  return nodes.flatMap((node) => {
    if (!node.children || node.children.length === 0) {
      return [
        new TitleInterface<number>({
          id: node.id!,
          title: node.full_title,
          subtitle: node.e_c_subject_id,
        }),
      ];
    }

    return flattenSubjectBranchTree(node.children);
  });
}

export default flattenSubjectBranchTree;
