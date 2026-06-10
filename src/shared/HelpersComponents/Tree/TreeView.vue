<script setup lang="ts">
  import TreeItem from './TreeItem.vue';
  export interface TreeNode {
    id: number | string;
    label: string;
    children?: TreeNode[];
  }
  const data: TreeNode[] = [
    {
      id: 1,
      label: 'ابتدائي',
      children: [
        {
          id: 2,
          label: 'Level 1',
          children: [{ id: 3, label: 'Class A' }],
        },
      ],
    },
    {
      id: 4,
      label: 'Liabilities',
    },
    {
      id: 5,
      label: 'Equity',
    },
  ];
  const handle = (node: TreeNode) => {
    console.log(node);
  };
  // defineProps<{
  //   data: TreeNode[];
  // }>();
</script>

<template>
  <div>
    <TreeItem v-for="node in data" :key="node.id" :node="node" @handle-item-click="handle" />
  </div>
</template>
