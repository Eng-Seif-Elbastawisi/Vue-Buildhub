<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import EducationTypeItem from './EducationTypeItem.vue';
  import AddEducationTypeDialog from '@/modules/EducationClassification/subComponent/EducationTree/AddEducationTypeDialog.vue';
  import AddBranchDialog from '@/modules/EducationClassification/subComponent/EducationTree/AddBranchDialog.vue';
  import EducationTreeController from '../../controllers/EducationTree/education.configuration.tree.controller';
  import { useRoute } from 'vue-router';
  import FetchTreeConfigurationTreeParams from '@/modules/EducationClassification/core/params/EducationTree/fetch.tree.configuration.params';
  import type BranchesModel from '@/modules/EducationClassification/core/models/EducationTree/branches.model';
  import AddEducationConfigurationTreeParams from '@/modules/EducationClassification/core/params/EducationTree/add.education.configuration.tree.params';

  interface TreeNode {
    id: string;
    name: string;
    level: number;
    children: TreeNode[];
  }
  const { locale } = useI18n();
  const controller = EducationTreeController.getInstance();

  function getBranchName(level: number): string {
    const data = state.value.value.data;
    if (!data || !data[0]) return `Branch ${level + 1}`;
    const branch = (data[0] as any).branches?.find((b: any) => b.levelNumber === level + 1);
    if (!branch) return `Branch ${level + 1}`;
    const lang = locale.value === 'ar' ? 'ar' : 'en';
    return branch.singularTitle[lang] || branch.singularTitle['en'] || `Branch ${level + 1}`;
  }

  /** Recursively converts a BranchesModel (and all its nested branches) into a TreeNode. */
  function mapBranch(branch: BranchesModel, level: number): TreeNode {
    return {
      id: String(branch.branch_id),
      name: branch.branch_title,
      level,
      children: branch.branches.map((child) => mapBranch(child, level + 1)),
    };
  }

  const route = useRoute();
  const educationTypes = ref<TreeNode[]>([]);
  const searchQuery = ref('');
  const showAddTypeDialog = ref(false);
  const showAddBranchDialog = ref(false);
  const selectedType = ref<TreeNode | null>(null);
  const branchDialogLevel = ref(1);
  const branchDialogParent = ref<TreeNode | null>(null);
  const branchDialogBranchId = ref<number | undefined>(undefined);
  const branchDialogName = ref('');
  const maxLevels = ref(0);

  const filteredTypes = ref<TreeNode[]>([]);
  function openAddTypeDialog() {
    showAddTypeDialog.value = true;
  }

  function openAddBranchDialog({ node, level }: { node: TreeNode; level: number }) {
    branchDialogParent.value = node;
    branchDialogLevel.value = level;
    branchDialogBranchId.value = Number(node.id);
    branchDialogName.value = getBranchName(level - 1);
    showAddBranchDialog.value = true;
  }

  async function handleAddType(name: Record<string, string>) {
    const AddBranchParams = new AddEducationConfigurationTreeParams({
      education_classification_id: Number(route.params.id),
      branch_title: name.en || name.ar || '',
    });
    await controller.create(AddBranchParams);
    showAddTypeDialog.value = false;
  }

  async function handleAddBranch(data: { name: Record<string, string>; level: number; branchId?: number }) {
    if (!branchDialogParent.value) return;
    showAddBranchDialog.value = false;
    const AddBranchParams = new AddEducationConfigurationTreeParams({
      education_classification_id: Number(route.params.id),
      branch_id: data.branchId,
      branch_title: data.name.en || data.name.ar || '',
    });
    await controller.create(AddBranchParams);
  }

  /** Select any node regardless of depth; leaf nodes will open the right-panel edit area. */
  function selectNode(node: TreeNode) {
    selectedType.value = node;
  }

  const FetchEducationTreeParams = new FetchTreeConfigurationTreeParams({
    education_classification_id: Number(route.params.id),
  });
  const state = computed(() => controller.listState);
  onMounted(async () => {
    await controller.fetchList(FetchEducationTreeParams);

    const data = state.value.value.data;
    if (!data) return;
    maxLevels.value = data[0]?.number_of_branches ?? 0;
    educationTypes.value = data.flatMap((item) =>
      (item.branches || []).map((branch) => mapBranch(branch, 0)),
    );
    filteredTypes.value = educationTypes.value;
  });
</script>
<template>
  <div class="education-tree">
    <!-- Left Panel -->
    <div class="left-panel">
      <!-- Search & Filter Bar -->
      <div class="toolbar">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.5" />
            <path
              d="M13 13l3.5 3.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search About Education Classification,Branch,Sub..."
            class="search-input"
          />
        </div>
        <button class="filter-btn">
          <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
            <path
              d="M3 5h14M6 10h8M9 15h2"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          {{ $t('Filter') }}
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="filteredTypes.length === 0 && !searchQuery" class="empty-state">
        <div class="empty-illustration">
          <svg viewBox="0 0 80 80" fill="none" width="72" height="72">
            <rect x="10" y="30" width="60" height="40" rx="4" fill="#e8f5e9" />
            <rect x="20" y="20" width="40" height="10" rx="2" fill="#c8e6c9" />
            <circle cx="40" cy="15" r="8" fill="#a5d6a7" />
            <path d="M30 50h20M30 58h14" stroke="#4caf50" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <p class="empty-title">{{ $t('No Education Tree Yet') }}</p>
        <p class="empty-desc">
          {{
            $t(
              "You Haven't Added Any Education Trees Yet. Start Now To Organize Your Learning Structure And Content",
            )
          }}
        </p>
        <button class="btn-primary" @click="openAddTypeDialog">
          {{ $t('Add Education Type') }}
        </button>
      </div>

      <!-- Tree List -->
      <div v-else class="tree-list">
        <EducationTypeItem
          v-for="type in filteredTypes"
          :key="type.id"
          :node="type"
          :branch-id="type.id"
          :max-levels="maxLevels"
          @add-branch="openAddBranchDialog($event)"
          @add-sub="openAddBranchDialog($event)"
          @select="selectNode($event)"
        />
      </div>

      <!-- Bottom Add Button -->
      <div v-if="educationTypes.length > 0" class="bottom-bar">
        <button class="btn btn-primary" @click="openAddTypeDialog">
          {{ $t('Add New Education Type') }}
        </button>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="right-panel">
      <template v-if="selectedType">
        <div class="right-header">
          <div class="right-title">
            <span>{{ selectedType.name }}</span>

            <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
              <rect x="3" y="3" width="14" height="14" rx="2" stroke="#4caf50" stroke-width="1.5" />
              <path
                d="M7 7h6M7 10h6M7 13h4"
                stroke="#4caf50"
                stroke-width="1.2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <!-- Add Branch only if we haven't reached max depth -->
          <button
            v-if="selectedType.level < maxLevels - 1"
            class="btn-outlined"
            @click="openAddBranchDialog({ node: selectedType, level: selectedType.level + 1 })"
          >
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
              <circle cx="10" cy="10" r="8" stroke="#4caf50" stroke-width="1.4" />
              <path d="M10 7v6M7 10h6" stroke="#4caf50" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <!-- Leaf node: placeholder for future edit UI -->
        <div v-if="selectedType.level >= maxLevels - 1" class="right-leaf">
          <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
            <rect x="8" y="8" width="48" height="48" rx="6" fill="#e8f5e9" />
            <path
              d="M20 32h24M20 22h24M20 42h16"
              stroke="#4caf50"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <p class="right-leaf-title">{{ selectedType.name }}</p>
          <p class="hint-text">
            {{
              $t('This is a final-level branch. The edit interface will be available here soon.')
            }}
          </p>
        </div>

        <!-- Non-leaf node with no children yet -->
        <div v-else-if="selectedType.children.length === 0" class="right-empty">
          <p class="hint-text">{{ $t('No branches yet. Click "+ Add Branch" to get started.') }}</p>
        </div>
      </template>
      <div v-else class="right-placeholder">
        <p>{{ $t('Select a branch from the tree to view details') }}</p>
      </div>
    </div>

    <!-- Add Education Type Dialog -->
    <AddEducationTypeDialog
      v-if="showAddTypeDialog"
      v-model:visible="showAddTypeDialog"
      @confirm="handleAddType"
    />

    <!-- Add Branch Dialog -->
    <AddBranchDialog
      v-if="showAddBranchDialog"
      v-model:visible="showAddBranchDialog"
      :level="branchDialogLevel"
      :branch-id="branchDialogBranchId"
      :branch-name="branchDialogName"
      @confirm="handleAddBranch"
    />
  </div>
</template>
