<script setup lang="ts">
  import { ref, inject, watch, computed } from 'vue';
  import type { Ref } from 'vue';
  import type EducationStageModel from '@/modules/EducationClassification/core/models/EducationStage/education.stages.model';
  import DropList from '@/shared/HelpersComponents/DropList.vue';
  import EditIcon from '@/shared/icons/DropListIcons/EditIcon.vue';
  import DeletIcon from '@/shared/icons/DropListIcons/DeletIcon.vue';
  import { useI18n } from 'vue-i18n';
  import RenameClassificationDialog from '@/modules/EducationClassification/subComponent/RenameClassificationDialog.vue';
  // import ToggleSwitch from 'primevue/toggleswitch';
  import DeleteEducationStageParams from '@/modules/EducationClassification/core/params/EducationStages/delete.education.stage.params';
  import EducationStageController from '../../controllers/EducationStages/education.stages.controller';

  export interface StageNode {
    stage: EducationStageModel;
    children: StageNode[];
    isLoaded: boolean;
    isLoading: boolean;
    depth: number;
  }

  const props = defineProps<{
    node: StageNode;
    selectedStageId: number | null;
    MaxDepth: number;
    parentId: number | null;
  }>();

  const emit = defineEmits<{
    (e: 'fetch-children', parentId: number, callback: (children: StageNode[]) => void): void;
    (e: 'add-child', stageId: number, level: number): void;
    (e: 'select', node: StageNode): void;
    (e: 'delete-branch', parentId: number | null): void;
  }>();

  const refreshParentId = inject<Ref<number | null>>('refreshParentId', ref(null));

  const canAddChild = computed(() => props.node.depth + 1 < props.MaxDepth);
  const isOpen = ref(false);
  const isLoading = ref(false);
  const hasFetched = ref(false);
  const children = ref<StageNode[]>([]);

  watch(refreshParentId, async (id) => {
    if (id !== props.node.stage.stage_id) return;
    isLoading.value = true;
    await new Promise<void>((resolve) => {
      emit('fetch-children', props.node.stage.stage_id, (fetched) => {
        children.value = fetched;
        hasFetched.value = true;
        isLoading.value = false;
        resolve();
      });
    });
    isOpen.value = true;
  });

  async function handleRowClick() {
    emit('select', props.node);
    await handleToggle();
  }

  async function handleToggle() {
    if (hasFetched.value && children.value.length === 0) return;

    if (!hasFetched.value) {
      isLoading.value = true;
      await new Promise<void>((resolve) => {
        emit('fetch-children', props.node.stage.stage_id, (fetched) => {
          children.value = fetched;
          hasFetched.value = true;
          isLoading.value = false;
          resolve();
        });
      });
    }

    if (children.value.length > 0) {
      isOpen.value = !isOpen.value;
    }
  }

  function handleAddChild() {
    emit('add-child', props.node.stage.stage_id, props.node.depth + 2);
  }

  function onChildFetch(parentId: number, callback: (children: StageNode[]) => void) {
    emit('fetch-children', parentId, callback);
  }

  function onChildAdd(stageId: number, level: number) {
    emit('add-child', stageId, level);
  }

  function onChildSelect(node: StageNode) {
    emit('select', node);
  }

  function isArabic(text: string) {
    return /[؀-ۿ]/.test(text);
  }

  const ShoweEditDialog = ref(false);
  const { t } = useI18n();
  const controller = EducationStageController.getInstance();

  async function deleteEducationClassification(id: number) {
    await controller.delete(new DeleteEducationStageParams({ stage_id: id }));
    emit('delete-branch', props.parentId);
  }
  // function toggleStatus(id: number) {
  //   console.warn('Toggle status not implemented for id:', id);
  // }

  const actionList = (id: number) => [
    {
      text: t('rename'),
      icon: EditIcon,
      action: () => {
        ShoweEditDialog.value = true;
      },
    },
    {
      text: t('delete'),
      icon: DeletIcon,
      action: () => deleteEducationClassification(id),
    },
    // {
    //   text: t(props.node.stage.status === 1 ? 'active' : 'unactive'),
    //   icon: ToggleSwitch,
    //   action: () => {
    //     toggleStatus(id);
    //   },
    // },
  ];
</script>

<template>
  <div class="tree-node-wrapper">
    <div
      class="node-row"
      :class="{ 'is-selected': selectedStageId === node.stage.stage_id }"
      :style="{ paddingLeft: `${node.depth * 16 + 14}px` }"
      @click="handleRowClick"
    >
      <button
        v-if="(!hasFetched || children.length > 0) && node.depth + 1 != MaxDepth"
        class="toggle-btn"
        @click.stop="handleToggle"
      >
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

      <svg
        v-if="node.depth + 1 != MaxDepth"
        viewBox="0 0 20 20"
        fill="none"
        width="16"
        height="16"
        class="node-icon"
      >
        <path
          d="M3 7a2 2 0 012-2h3.5l1.5 1.5H15a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
          stroke="#4caf50"
          stroke-width="1.3"
          fill="none"
        />
      </svg>
      <svg v-else viewBox="0 0 20 20" fill="none" width="16" height="16" class="node-icon">
        <rect
          x="4"
          y="3"
          width="12"
          height="14"
          rx="2"
          stroke="#4caf50"
          stroke-width="1.3"
          fill="none"
        />
        <path d="M7 8h6M7 11h6M7 14h4" stroke="#4caf50" stroke-width="1.1" stroke-linecap="round" />
      </svg>

      <span v-if="node.depth > 0" class="level-label">{{ $t('branch') }} {{ node.depth }}</span>

      <span class="node-name" :class="{ 'rtl-text': isArabic(node.stage.stage_title) }">
        {{ node.stage.stage_title }}
      </span>

      <span class="spacer" />

      <button v-if="canAddChild" class="icon-btn" title="Add child" @click.stop="handleAddChild">
        <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
          <circle cx="10" cy="10" r="8" stroke="#4caf50" stroke-width="1.4" />
          <path d="M10 7v6M7 10h6" stroke="#4caf50" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>

      <button class="icon-btn" @click.stop>
        <DropList
          :action-list="actionList(node.stage.stage_id)"
          :delete-dialog-title="$t('are_you_sure_you_want_to_remove_this_education_classification')"
          :delete-dialog-message="
            $t(
              'Deleting_this_classification_will_remove_all_related_data_including_any_configurations_and_tree_structures_This_action_is_irreversible_and_the_classification_must_be_created_again_if_needed',
            )
          "
        />
        <RenameClassificationDialog
          v-model:visable="ShoweEditDialog"
          :item-id="node.stage.stage_id"
          :parent-id="parentId ?? 0"
          @update:name="$emit('delete-branch', parentId)"
        />
      </button>
    </div>
    <transition name="slide-down">
      <div v-if="isOpen && children.length > 0" class="children-wrapper">
        <StageTreeNode
          v-for="child in children"
          :key="child.stage.stage_id"
          :node="child"
          :MaxDepth="MaxDepth"
          :selected-stage-id="selectedStageId"
          :parent-id="node.stage.stage_id"
          @fetch-children="onChildFetch"
          @add-child="onChildAdd"
          @select="onChildSelect"
          @delete-branch="$emit('delete-branch', $event)"
        />
      </div>
    </transition>
  </div>
</template>

<style scoped></style>
