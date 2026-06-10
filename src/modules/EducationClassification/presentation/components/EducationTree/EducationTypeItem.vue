<script setup lang="ts">
  import { ref } from 'vue';
  import NodeIcon from '@/shared/icons/Nodeicon.vue';

  interface TreeNode {
    id: string;
    name: string;
    level: number;
    children: TreeNode[];
    // maxLevel: number;
  }

  const props = defineProps<{ node: TreeNode; maxLevels: number }>();
  const emit = defineEmits<{
    (e: 'add-branch', payload: { node: TreeNode; level: number }): void;
    (e: 'add-sub', payload: { node: TreeNode; level: number }): void;
    (e: 'select', payload: TreeNode): void;
  }>();

  const isOpen = ref(true);
  const isSelected = ref(false);

  function handleSelect() {
    emit('select', props.node);
  }

  function emitAdd() {
    emit('add-branch', { node: props.node, level: props.node.level + 1 });
  }

  function isArabic(text: string) {
    return /[\u0600-\u06FF]/.test(text);
  }
</script>
<template>
  <div class="tree-node-wrapper">
    <!-- Node Row -->
    <div
      class="node-row"
      :class="{ 'is-selected': isSelected }"
      :style="{ paddingLeft: `${node.level * 16 + 14}px` }"
      @click="handleSelect"
    >
      <!-- Expand/Collapse toggle -->
      <button v-if="node.children.length > 0" class="toggle-btn" @click.stop="isOpen = !isOpen">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          width="14"
          height="14"
          :style="{
            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.2s',
          }"
        >
          <path
            d="M5 7l5 5 5-5"
            stroke="#6b7280"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <span v-else class="toggle-spacer" />

      <!-- Node Icon -->
      <!-- :maxLevel="ndoe" -->

      <NodeIcon :level="node.level" :max-levels="maxLevels" />

      <!-- Level Label -->
      <span v-if="node.level > 0" class="level-label">{{ $t('Branch') }} {{ node.level }}</span>

      <!-- Node Name (RTL for Arabic) -->
      <span class="node-name" :class="{ 'rtl-text': isArabic(node.name) }">{{ node.name }}</span>

      <span class="spacer" />

      <!-- Add Child Button — hidden at the deepest allowed level -->
      <button
        v-if="node.level < maxLevels - 1"
        class="icon-btn"
        title="Add child"
        @click.stop="emitAdd"
      >
        <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
          <circle cx="10" cy="10" r="8" stroke="#4caf50" stroke-width="1.4" />
          <path d="M10 7v6M7 10h6" stroke="#4caf50" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>

      <!-- Options Button -->
      <button class="icon-btn" @click.stop>
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <circle cx="10" cy="5" r="1.2" />
          <circle cx="10" cy="10" r="1.2" />
          <circle cx="10" cy="15" r="1.2" />
        </svg>
      </button>
    </div>

    <!-- Children (recursive) -->
    <transition name="slide-down">
      <div v-if="isOpen && node.children.length > 0" class="children-wrapper">
        <EducationTypeItem
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :max-levels="maxLevels"
          @add-branch="$emit('add-branch', $event)"
          @add-sub="$emit('add-sub', $event)"
          @select="$emit('select', $event)"
        />
      </div>
    </transition>
  </div>
</template>
