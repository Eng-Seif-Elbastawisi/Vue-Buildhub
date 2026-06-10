<script setup lang="ts">
  import { ref, inject, watch } from 'vue';
  import type { Ref } from 'vue';
  import type EducationSubjectModel from '@/modules/EducationClassification/core/models/EducationSubject/education.subject.model';
  import DropList from '@/shared/HelpersComponents/DropList.vue';
  import EditIcon from '@/shared/icons/DropListIcons/EditIcon.vue';
  import DeletIcon from '@/shared/icons/DropListIcons/DeletIcon.vue';
  import { useI18n } from 'vue-i18n';
  import RenameSubjectDialog from '@/modules/EducationClassification/subComponent/RenameSubjectDialog.vue';
  import DeleteEducationSubjectItemParams from '@/modules/EducationClassification/core/params/EducationSubjects/delete.education.subject.item.params';
  import EducationSubjectItemController from '../../controllers/educationSubject/education.subject.item.controller';
  import PricingIcon from '@/shared/icons/PricingIcon.vue';
  import PricingDialog from '@/modules/EducationClassification/subComponent/EducationTree/PricingDialog.vue';
  import SkillsDialog from '@/modules/EducationClassification/subComponent/EducationTree/SkillsDialog.vue';
  import TopicsDialog from '@/modules/EducationClassification/subComponent/EducationTree/TopicsDialog.vue';

  export interface SubjectNode {
    subject: EducationSubjectModel;
    children: SubjectNode[];
    isLoaded: boolean;
    isLoading: boolean;
    depth: number;
  }

  const props = defineProps<{
    node: SubjectNode;
    selectedSubjectId: number | null;
    maxDepth: number;
    parentId: number | null;
  }>();

  const emit = defineEmits<{
    (e: 'fetch-children', parentId: number, callback: (children: SubjectNode[]) => void): void;
    (e: 'add-child', subjectId: number, level: number): void;
    (e: 'select', node: SubjectNode): void;
    (e: 'delete-branch', parentId: number | null): void;
  }>();

  const refreshSubjectId = inject<Ref<number | null>>('refreshSubjectId', ref(null));
  const subjectStageId = inject<Ref<number>>('subjectStageId', ref(0));

  const canAddChild = props.node.depth + 1 < props.maxDepth;
  const isOpen = ref(false);
  const isLoading = ref(false);
  const hasFetched = ref(false);
  const children = ref<SubjectNode[]>([]);

  watch(refreshSubjectId, async (id) => {
    if (id !== props.node.subject.subject_id) return;
    isLoading.value = true;
    await new Promise<void>((resolve) => {
      emit('fetch-children', props.node.subject.subject_id, (fetched) => {
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
        emit('fetch-children', props.node.subject.subject_id, (fetched) => {
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
    emit('add-child', props.node.subject.subject_id, props.node.depth + 2);
  }

  function onChildFetch(parentId: number, callback: (children: SubjectNode[]) => void) {
    emit('fetch-children', parentId, callback);
  }

  function onChildAdd(subjectId: number, level: number) {
    emit('add-child', subjectId, level);
  }

  function onChildSelect(node: SubjectNode) {
    emit('select', node);
  }

  function isArabic(text: string) {
    return /[؀-ۿ]/.test(text);
  }

  const ShoweEditDialog = ref(false);
  const { t } = useI18n();
  const controller = EducationSubjectItemController.getInstance();

  async function deleteEducationClassification(id: number) {
    await controller.delete(new DeleteEducationSubjectItemParams({ subject_id: id }));
    emit('delete-branch', props.parentId);
  }
  const showPricingDialog = ref<boolean>(false);
  const showSkillsDialog = ref<boolean>(false);
  const showTopicsDialog = ref<boolean>(false);
  const isFirstLevel = props.node.depth === 0;
  const isLastLevel = props.node.depth + 1 === props.maxDepth;

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
    ...(isFirstLevel
      ? [
          {
            text: t('pricing'),
            icon: PricingIcon,
            action: () => (showPricingDialog.value = true),
          },
        ]
      : []),
    ...(isLastLevel
      ? [
          {
            text: t('skills'),
            icon: PricingIcon,
            action: () => (showSkillsDialog.value = true),
          },
          {
            text: t('topics'),
            icon: PricingIcon,
            action: () => (showTopicsDialog.value = true),
          },
        ]
      : []),
  ];
</script>

<template>
  <div class="tree-node-wrapper">
    <div
      class="node-row"
      :class="{ 'is-selected': selectedSubjectId === node.subject.subject_id }"
      :style="{ paddingLeft: `${node.depth * 16 + 14}px` }"
      @click="handleRowClick"
    >
      <button
        v-if="(!hasFetched || children.length > 0) && node.depth + 1 !== maxDepth"
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
        v-if="node.depth + 1 !== maxDepth"
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

      <span class="node-name" :class="{ 'rtl-text': isArabic(node.subject.subject_title) }">
        {{ node.subject.subject_title }}
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
          :action-list="actionList(node.subject.subject_id)"
          :delete-dialog-title="$t('are_you_sure_you_want_to_remove_this_education_classification')"
          :delete-dialog-message="
            $t(
              'Deleting_this_classification_will_remove_all_related_data_including_any_configurations_and_tree_structures_This_action_is_irreversible_and_the_classification_must_be_created_again_if_needed',
            )
          "
        />
        <!-- <div v-if="isLastLevel">
          aaa
        </div> -->
        <RenameSubjectDialog
          v-model:visable="ShoweEditDialog"
          :item-id="node.subject.subject_id"
          :stage-id="subjectStageId"
          @update:name="$emit('delete-branch', parentId)"
        />
      </button>
    </div>

    <transition name="slide-down">
      <div v-if="isOpen && children.length > 0" class="children-wrapper">
        <SubjectTreeNode
          v-for="child in children"
          :key="child.subject.subject_id"
          :node="child"
          :max-depth="maxDepth"
          :selected-subject-id="selectedSubjectId"
          :parent-id="node.subject.subject_id"
          @fetch-children="onChildFetch"
          @add-child="onChildAdd"
          @select="onChildSelect"
          @delete-branch="$emit('delete-branch', $event)"
        />
      </div>
    </transition>
    <PricingDialog
      v-model:visible="showPricingDialog" 
      :level="node.depth + 1"
      :branch-name="node.subject.subject_title"
      :branch-id="node.subject.subject_id"
      @update-visible="showPricingDialog = $event"
    />
    <SkillsDialog
      v-model:visible="showSkillsDialog"
      :level="node.depth + 1"
      :branch-name="node.subject.subject_title"
      :branch-id="node.subject.subject_id"
    />
    <TopicsDialog
      v-model:visible="showTopicsDialog"
      :level="node.depth + 1"
      :branch-name="node.subject.subject_title"
      :branch-id="node.subject.subject_id"
    />
  </div>
</template>
