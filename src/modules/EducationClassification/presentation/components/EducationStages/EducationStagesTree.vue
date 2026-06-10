<script setup lang="ts">
  import { ref, provide, onMounted, computed, nextTick } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import StageTreeNode from './StageTreeNode.vue';
  import type { StageNode } from './StageTreeNode.vue';
  import AddEducationTypeDialog from '@/modules/EducationClassification/subComponent/EducationTree/AddEducationTypeDialog.vue';
  import AddBranchDialog from '@/modules/EducationClassification/subComponent/EducationTree/AddBranchDialog.vue';
  import SubjectsPanel from '../EducationSubjects/SubjectsPanel.vue';
  import EducationStageController from '../../controllers/EducationStages/education.stages.controller';
  import EducationConfigurationController from '../../controllers/educationConfiguration/education.configuration.controller';
  import AddEducationStageParams from '@/modules/EducationClassification/core/params/EducationStages/add.education.stage.params';
  import FetchEducationStageParams from '@/modules/EducationClassification/core/params/EducationStages/fetch.education.stage.params';
  import type EducationStageModel from '@/modules/EducationClassification/core/models/EducationStage/education.stages.model';
  import type EducationConfigurationModel from '@/modules/EducationClassification/core/models/EducationConfiguration/education.configuration.model';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  // import DialogIconFillter from '@/shared/icons/DialogIconFillter.vue';
  import RenameClassificationDialog from '@/modules/EducationClassification/subComponent/RenameClassificationDialog.vue';
  import DropList from '@/shared/HelpersComponents/DropList.vue';
  import EditIcon from '@/shared/icons/DropListIcons/EditIcon.vue';
  import DeletIcon from '@/shared/icons/DropListIcons/DeletIcon.vue';
  import Dialog from 'primevue/dialog';
  import PriceIconDialog from '@/shared/icons/priceIconDialog.vue';
  import InputNumber from 'primevue/inputnumber';
  import Skills from '@/assets/images/Skills.png';
  import TranslationParams from '@/modules/about/core/params/translation.params';
  import EmptyTree from '@/assets/images/EmptyTree.gif';

  const route = useRoute();
  const { locale } = useI18n();
  const classificationId = Number(route.params.id);
  const controller = EducationStageController.getInstance();
  const configController = EducationConfigurationController.getInstance();
  const MaxNumberOfBranches = ref();
  const rootNodes = ref<StageNode[]>([]);
  const selectedNode = ref<StageNode | null>(null);
  const showAddTypeDialog = ref(false);
  const showAddBranchDialog = ref(false);
  const branchDialogLevel = ref(1);
  const branchDialogParentId = ref<number | undefined>(undefined);
  const branchDialogName = ref('');
  const educationConfig = ref<EducationConfigurationModel[] | null>(null);
  const refreshParentId = ref<number | null>(null);

  const maxDepth = computed(() => educationConfig.value?.[0]?.numberOfBranches);

  function getBranchName(parentDepth: number): string {
    const branches = educationConfig.value?.[0]?.branches ?? [];
    const branch = branches.find((b) => b.levelNumber === parentDepth + 1);
    if (!branch) return `Branch ${parentDepth + 1}`;
    const lang = locale.value === 'ar' ? 'ar' : 'en';
    return branch.singularTitle[lang] ?? branch.singularTitle['en'] ?? `Branch ${parentDepth + 1}`;
  }

  function makeNode(stage: EducationStageModel, depth: number): StageNode {
    return { stage, children: [], isLoaded: false, isLoading: false, depth };
  }

  function findNode(nodes: StageNode[], id: number): StageNode | null {
    for (const n of nodes) {
      if (n.stage.stage_id === id) return n;
      const found = findNode(n.children, id);
      if (found) return found;
    }
    return null;
  }

  async function fetchRoot(word?: string) {
    const params = new FetchEducationStageParams({
      classification_id: classificationId,
      search: word,
    });
    const result = await controller.fetchList(params);
    if (result instanceof DataSuccess) {
      rootNodes.value = (result.data ?? []).map((s: EducationStageModel) => makeNode(s, 0));
    }
  }

  async function fetchChildren(parentId: number, callback: (children: StageNode[]) => void) {
    const parentNode = findNode(rootNodes.value, parentId);
    const params = new FetchEducationStageParams({
      classification_id: classificationId,
      parent_id: parentId,
    });
    const result = await controller.fetchList(params);
    const children =
      result instanceof DataSuccess
        ? (result.data ?? []).map((s: EducationStageModel) =>
            makeNode(s, (parentNode?.depth ?? 0) + 1),
          )
        : [];
    if (parentNode) {
      parentNode.children = children;
      parentNode.isLoaded = true;
    }
    callback(children);
  }

  function selectNode(node: StageNode) {
    selectedNode.value = node;
  }

  function openAddChildDialog(stageId: number, level: number) {
    branchDialogParentId.value = stageId;
    branchDialogLevel.value = level;
    branchDialogName.value = getBranchName(level - 1);
    showAddBranchDialog.value = true;
  }

  async function handleAddType(name: Record<string, string>) {
    const params = new AddEducationStageParams({
      translations: new TranslationParams({ title: name }),
      classification_id: classificationId,
    });
    await controller.create(params);
    showAddTypeDialog.value = false;
    await fetchRoot();
  }

  async function handleAddBranch({
    name,
    branchId,
  }: {
    name: Record<string, string>;
    level: number;
    branchId?: number;
  }) {
    if (!branchId) return;
    const params = new AddEducationStageParams({
      translations: new TranslationParams({ title: name }),
      classification_id: classificationId,
      parent_id: branchId,
    });
    await controller.create(params);
    showAddBranchDialog.value = false;
    refreshParentId.value = branchId;
    await nextTick();
    refreshParentId.value = null;
  }

  provide('maxDepth', maxDepth);
  provide('refreshParentId', refreshParentId);
  onMounted(async () => {
    const configResult = await configController.fetchList(
      new FetchEducationStageParams({
        classification_id: Number(route.params.id),
      }),
    );
    MaxNumberOfBranches.value = configResult.data?.[0]?.numberOfBranches;
    if (configResult instanceof DataSuccess && configResult.data) {
      educationConfig.value = configResult.data;
    }
    if (!selectedNode.value) {
      fetchRoot();
    }
  });

  const ShoweEditDialog = ref(false);
  const showPricingDialog = ref(false);
  const showSkillsDialog = ref(false);
  const { t } = useI18n();
  const actionList = (_id: number) => [
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
      action: () => handleDeleteBranch(null),
    },
    // {
    //   text: t('pricing'),
    //   icon: PriceDialog,
    //   action: () => {
    //     showPricingDialog.value = true;
    //   },
    // },
    // {
    //   text: t('skills'),
    //   icon: SkillsDilaog,
    //   action: () => {
    //     showSkillsDialog.value = true;
    //   },
    // },
    // {
    //   text: t('unactive'),
    //   icon: ToggleSwitch,
    //   action: () => {
    //     toggleStatus(id);
    //   },
    // },
  ];
  // async function toggleStatus(id: number) {
  //   console.log('Toggle status for', id);
  //   // await controller.toggleStatus(id);
  // }
  const duration = ref(0);
  const pricing = ref(0);

  async function handleDeleteBranch(parentId: number | null) {
    if (parentId === null) {
      await fetchRoot();
    } else {
      refreshParentId.value = parentId;
      await nextTick();
      refreshParentId.value = null;
    }
  }

  async function fetchEducationStagesTree() {
    if (!selectedNode.value) return;
    refreshParentId.value = selectedNode.value.stage.stage_id;
    await nextTick();
    refreshParentId.value = null;
  }

  const SearchTree = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // console.log(value);
    await fetchRoot(value);
  } 
</script>

<template>
  <div class="education-tree">
    <!-- Left Panel -->
    <div class="left-panel">
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
            type="text"
            placeholder="Search About Education Classification,Branch,Sub..."
            class="search-input"
            @input="SearchTree"
          />
        </div>
        <!-- <button class="filter-btn">
          <DialogIconFillter />
          {{ $t('Filter') }}
        </button> -->
      </div>

      <!-- Empty State -->
      <div v-if="rootNodes.length === 0" class="empty-state">
        <div class="empty-illustration">
          <img :src="EmptyTree" alt="empty tree" width="200" />
        </div>
        <p class="empty-title">{{ $t('No Education Tree Yet') }}</p>
        <p class="empty-desc">
          {{
            $t(
              "You Haven't Added Any Education Trees Yet. Start Now To Organize Your Learning Structure And Content",
            )
          }}
        </p>
        <button class="btn btn-primary w-full" @click="showAddTypeDialog = true">
          {{ $t('Add Education Type') }}
        </button>
      </div>

      <!-- Tree List -->
      <div v-else class="tree-list">
        <StageTreeNode
          v-for="node in rootNodes"
          :key="node.stage.stage_id"
          :node="node"
          :MaxDepth="MaxNumberOfBranches"
          :parent-id="null"
          :selected-stage-id="selectedNode?.stage.stage_id ?? null"
          @fetch-children="fetchChildren"
          @add-child="openAddChildDialog"
          @select="selectNode"
          @delete-branch="handleDeleteBranch"
        />
      </div>

      <div v-if="rootNodes.length > 0">
        <button class="btn btn-primary w-full" @click="showAddTypeDialog = true">
          {{ $t('Add New') }} {{ getBranchName(0) }}
        </button>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="right-panel">
      <template v-if="selectedNode">
        <!-- Final-depth stage: show subjects panel -->

        <SubjectsPanel
          v-if="selectedNode.depth + 1 === MaxNumberOfBranches"
          :stage-id="selectedNode.stage.stage_id"
          :stage-name="selectedNode.stage.stage_title"
        />
        <!-- Non-final stage: show children list -->
        <template v-else>
          <div class="right-header">
            <div class="right-title">
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                <rect
                  x="3"
                  y="3"
                  width="14"
                  height="14"
                  rx="2"
                  stroke="#4caf50"
                  stroke-width="1.5"
                />
                <path
                  d="M7 7h6M7 10h6M7 13h4"
                  stroke="#4caf50"
                  stroke-width="1.2"
                  stroke-linecap="round"
                />
              </svg>
              <span>{{ selectedNode.stage.stage_title }}</span>
            </div>
            <button
              v-if="selectedNode.depth + 1 < (maxDepth ?? 0)"
              class="btn-add-branch"
              @click="openAddChildDialog(selectedNode.stage.stage_id, selectedNode.depth + 2)"
            >
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                <circle cx="10" cy="10" r="8" stroke="#4caf50" stroke-width="1.4" />
                <path
                  d="M10 7v6M7 10h6"
                  stroke="#4caf50"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <!-- Children list -->
          <div v-if="selectedNode.children.length > 0" class="right-children">
            <div
              v-for="child in selectedNode.children"
              :key="child.stage.stage_id"
              class="right-child-row"
            >
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16" class="child-icon">
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
                <path
                  d="M7 8h6M7 11h6M7 14h4"
                  stroke="#4caf50"
                  stroke-width="1.1"
                  stroke-linecap="round"
                />
              </svg>
              <span class="child-name">{{ child.stage.stage_title }}</span>
              <span class="level-label">{{ getBranchName(child.depth - 1) }}</span>
              <span class="spacer" />
              <button
                v-if="child.depth + 1 < (maxDepth ?? 0)"
                class="icon-btn"
                @click="openAddChildDialog(child.stage.stage_id, child.depth + 3)"
              >
                <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                  <circle cx="10" cy="10" r="8" stroke="#4caf50" stroke-width="1.4" />
                  <path
                    d="M10 7v6M7 10h6"
                    stroke="#4caf50"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
              <button class="icon-btn" @click.stop>
                <DropList
                  :action-list="actionList(child.stage.stage_id)"
                  :delete-dialog-title="
                    $t('are_you_sure_you_want_to_remove_this_education_classification')
                  "
                  :delete-dialog-message="
                    $t(
                      'Deleting_this_classification_will_remove_all_related_data_including_any_configurations_and_tree_structures_This_action_is_irreversible_and_the_classification_must_be_created_again_if_needed',
                    )
                  "
                />
                <RenameClassificationDialog
                  v-model:visable="ShoweEditDialog"
                  :item-id="child.stage.stage_id"
                  :parent-id="selectedNode.stage.stage_id"
                  @update:name="fetchEducationStagesTree"
                />
              </button>
            </div>
          </div>

          <div v-else class="right-empty">
            <p class="hint-text">
              {{ $t('No branches yet. Click Add Branch to get started.') }}
            </p>
          </div>
        </template>
      </template>

      <div v-else class="right-placeholder">
        <p>{{ $t('Select a stage from the tree to view details') }}</p>
      </div>
    </div>
  </div>
  <!-- pricing dialog -->
  <Dialog
    v-model:visible="showPricingDialog"
    modal
    :pt="{
      root: 'dialog-pricing',
      header: 'dialog-header',
      content: 'dialog-body',
    }"
  >
    <template #header>
      <div class="dialog-header">
        <div class="icon">
          <PriceIconDialog />
        </div>
        <div class="contant">
          <h6>{{ $t('subject pricing') }}</h6>
          <p>{{ $t('Manage how each subject is priced within your system.') }}</p>
        </div>
      </div>
    </template>
    <div class="inputs-pricing">
      <div class="input-group">
        <label for="duration">{{ $t('duration (month only)') }}</label>
        <InputNumber v-model="duration" input-id="duration" fluid />
      </div>
      <div class="input-group">
        <label for="price">{{ $t('pricing') }}</label>
        <InputNumber v-model="pricing" input-id="price" fluid />
      </div>
    </div>
    <div class="dialog-footer">
      <button class="btn btn-primary" @click="showPricingDialog = false">{{ $t('add') }}</button>
      <button class="btn btn-secondary" @click="showPricingDialog = false">
        {{ $t('cancel') }}
      </button>
    </div>
  </Dialog>
  <!-- skillls dialog -->
  <Dialog
    v-model:visible="showSkillsDialog"
    modal
    :pt="{
      root: 'dialog-pricing',
      header: 'dialog-header',
      content: 'dialog-body',
    }"
  >
    <template #header>
      <div class="dialog-header">
        <div class="icon">
          <!-- <Skillsicon /> -->
          <img :src="Skills" alt="skills" width="200" />
        </div>
        <div class="contant">
          <h6>{{ $t('skills') }}</h6>
          <p>{{ $t('Define and manage skills within the system.') }}</p>
        </div>
      </div>
    </template>
    <!-- <div class="inputs-pricing">
      <div class="input-group">
        <UpdatedCustomInputSelect
          id="doc-subject"
          :label="`Subject Name`"
          :params="indexDocumentTypeParams"
          :controller="documentTypeController"
          :model-value="selectedDocumentType"
          placeholder="Subject Type"
          @update:model-value="updateData"
        />
      </div>
      <div class="input-group">
        <label for="price">{{ $t('percentage (%)') }}</label>
        <InputNumber
          v-model="skillPercentage"
          input-id="skillPercentage"
          :placeholder="`${t('enter percentage like 20% ')}....`"
          fluid
        />
      </div>
    </div> -->
    <div class="dialog-footer">
      <button class="btn btn-primary" @click="showSkillsDialog = false">{{ $t('add') }}</button>
      <button class="btn btn-secondary" @click="showSkillsDialog = false">
        {{ $t('cancel') }}
      </button>
    </div>
  </Dialog>

  <!-- {{ educationConfig[0]?.branches[0].singularTitle[locale] }} -->
  <AddEducationTypeDialog
    v-if="showAddTypeDialog"
    v-model:visible="showAddTypeDialog"
    :header="`Add New ${getBranchName(0)}`"
    @confirm="handleAddType"
  />

  <AddBranchDialog
    v-if="showAddBranchDialog"
    v-model:visible="showAddBranchDialog"
    :level="branchDialogLevel"
    :branch-id="branchDialogParentId"
    :branch-name="branchDialogName"
    @confirm="handleAddBranch"
  />
  <!-- </template> -->
  <!-- </DataStatusBuilder> -->
</template>

<style scoped lang="scss"></style>
