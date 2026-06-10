<script setup lang="ts">
  import AddBranch from '@/shared/icons/AddBranch.vue';
  import FolderIcon from '@/shared/icons/FolderIcon.vue';
  import { ref } from 'vue';
  export interface TreeNode {
    id: number | string;
    label: string;
    children?: TreeNode[];
  }
  const props = defineProps<{
    node: TreeNode;
  }>();
  const emit = defineEmits(['handleItemClick']);

  const isOpen = ref(false);

  const hasChildren = props.node.children && props.node.children.length > 0;

  const toggle = () => {
    if (hasChildren) isOpen.value = !isOpen.value;
  };
</script>

<template>
  <div class="tree-item">
    <div class="tree-label">
      <!-- <span v-if="hasChildren" @click="toggle">
        {{ isOpen ? "📂" : "📁" }}
        {{ node.label }}
      </span> -->
      <span v-if="hasChildren" class="tree-label-item" @click="toggle">
        <AddBranch />
        <FolderIcon />
        <span>
          {{ node.label }}
        </span>
      </span>
      <span v-else @click="$emit('handleItemClick', node)"
        >📄
        {{ node.label }}
      </span>
    </div>

    <div v-if="hasChildren && isOpen" class="tree-children">
      <TreeItem
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        @handle-item-click="emit('handleItemClick', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
  .tree-item {
    padding-left: 10px;
  }

  .tree-label {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tree-label-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tree-children {
    margin-left: 15px;
    border-left: 1px dashed #ccc;
    padding-left: 10px;
  }
</style>
