<script setup lang="ts">
  import { ref, computed, watch, nextTick } from 'vue';
  import Dialog from 'primevue/dialog';
  import AddEducationSubjectSkillsParams from '../../core/params/EducationSkills/add.education.subject.skills.params';
  import EditEducationSubjectSkillsParams from '../../core/params/EducationSkills/edit.education.subject.skills.params';
  import DeleteEducationSubjectSkillsParams from '../../core/params/EducationSkills/delete.education.subject.skills.params';
  import IndexEducationSubjectSkillsParams from '../../core/params/EducationSkills/index.education.subject.skills.params';
  import ShowEducationSubjectSkillsParams from '../../core/params/EducationSkills/show.education.subject.skills.params';
  import EducationSkillsController from '../../presentation/controllers/EducationSkills/education.skills.controller';
  import SkillParams from '../../core/params/EducationSkills/skill.params';
  import SubjectSkllsIcon from '@/assets/images/Skills.png';
  import SkillsController from '@/modules/Skills/presentation/controllers/skills.controller';
  import IndexSkillsParams from '@/modules/Skills/core/params/index.skills.params';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import EditeIcon from '@/shared/icons/DocaumentType/EditeIcon.vue';
  import IndexDelete from '@/shared/icons/DocaumentType/IndexDelete.vue';

  const props = defineProps<{
    visible: boolean;
    level: number;
    branchName: string;
    branchId?: number;
  }>();

  const emit = defineEmits<{
    (e: 'update:visible', val: boolean): void;
  }>();

  const skillsController = SkillsController.getInstance();
  const educationSkillsController = EducationSkillsController.getInstance();
  const indexSkills = new IndexSkillsParams('', 1, 10, 1);

  const skillsState = computed(() => educationSkillsController.listState.value);

  const isEdit = ref(false);
  const editId = ref<number | null>(null);
  const percentageValue = ref<number | null>(null);
  const selectedSkill = ref<TitleInterface<number> | undefined>(undefined);
  const inputRef = ref<HTMLInputElement | null>(null);

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val),
  });

  watch(dialogVisible, async (val) => {
    if (val) {
      resetForm();
      await fetchSkills();
      await nextTick();
      inputRef.value?.focus();
    }
  });

  const isInputEmpty = computed(() => !percentageValue.value || !selectedSkill.value);

  function resetForm() {
    percentageValue.value = null;
    selectedSkill.value = undefined;
    isEdit.value = false;
    editId.value = null;
  }

  const fetchSkills = async () => {
    if (!props.branchId) return;
    const res = await educationSkillsController.fetchList(
      new IndexEducationSubjectSkillsParams({ subjectId: props.branchId }),
    );
    console.log(res.data, 'res');
  };

  const updateSelectedSkill = (skill: TitleInterface<number>) => {
    selectedSkill.value = skill;
  };

  const handleSave = async () => {
    if (isEdit.value && editId.value !== null && selectedSkill.value) {
      await educationSkillsController.update(
        new EditEducationSubjectSkillsParams({
          entryId: editId.value,
          skillId: selectedSkill.value.id,
          percentage: percentageValue.value?.toString() || '0',
          educationClassificationSubjectId: props.branchId!,
        }),
      );
    } else if (props.branchId && selectedSkill.value) {
      await educationSkillsController.create(
        new AddEducationSubjectSkillsParams({
          id: props.branchId,
          skills: [
            new SkillParams({
              skillId: selectedSkill.value.id,
              percentage: percentageValue.value?.toString() || '0',
            }),
          ],
        }),
      );
    }
    await fetchSkills();
    resetForm();
  };

  const deleteSkill = async (id: number) => {
    await educationSkillsController.delete(new DeleteEducationSubjectSkillsParams({ entryId: id }));
    await fetchSkills();
  };

  const showDetails = async (id: number) => {
    isEdit.value = true;
    editId.value = id;
    const res = await educationSkillsController.fetchOne(
      new ShowEducationSubjectSkillsParams({ entryId: id }),
    );
    if (res?.data) {
      percentageValue.value = res.data.percentage as number;
      if (res.data.skill) {
        selectedSkill.value = {
          id: res.data.skill.id,
          title: res.data.skill.title,
        } as TitleInterface<number>;
      }
    }
  };
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :style="{ width: '35rem' }"
    :pt="{
      root: 'pricing-dialog',
      header: 'dialog-header',
      content: 'dialog-body',
    }"
  >
    <template #header>
      <div class="dialog-icon">
        <img :src="SubjectSkllsIcon" alt="skills" width="60" />
      </div>
      <div class="dialog-header-text">
        <h3 class="dialog-title">{{ $t('skills') }}</h3>
        <p class="dialog-subtitle">
          {{ $t('Define and manage skills within the system.') }}
        </p>
      </div>
    </template>

    <div class="dialog-content">
      <div v-for="(item, index) in skillsState.data" :key="index" class="document-type-row">
        <div class="item-title">
          <span class="item-small-title">{{ $t('skill') }}</span>
          <span class="item-main-title">{{ item.skill.title }}</span>
        </div>
        <div class="item-title">
          <span class="item-small-title">{{ $t('percentage (%)') }}</span>
          <span class="item-main-title">{{ item.percentage }}%</span>
        </div>
        <div class="item-actions">
          <EditeIcon @click="showDetails(item.id)" />
          <DeleteDialog
            :title="$t('Are you sure you want to remove this skill?')"
            :message="$t('This action cannot be undone.')"
            :hasbtn="true"
            @delete="deleteSkill(item.id)"
          >
            <template #btn>
              <IndexDelete />
            </template>
          </DeleteDialog>
        </div>
      </div>

      <div class="dialog-inputs">
        <div class="field-group select-group">
           <span class="error-message-inputs">  {{ selectedSkill }}</span>
        
          <UpdatedCustomInputSelect
            id="skills"
            :label="`skills`"
            :params="indexSkills"
            :controller="skillsController"
            :type="1"
            :model-value="selectedSkill as TitleInterface<number>"
            :placeholder="$t('skills')"
            @update:model-value="updateSelectedSkill"
          />
        </div>
        <div class="field-group">
          <label class="field-label" :for="`percentage-input-${level}`">
            {{ $t('percentage (%)') }}
          </label>
          <input
            :id="`percentage-input-${level}`"
            ref="inputRef"
            v-model="percentageValue"
            type="number"
            min="0"
            max="100"
            :placeholder="$t('enter_percentage')"
            class="field-input"
            @keydown.esc="dialogVisible = false"
            @keydown.enter="!isInputEmpty && handleSave()"
          /> 
          <!-- <span class="error-message-inputs" v-if="percentageValue < 0 || percentageValue > 100   || typeof percentageValue === 'string' ">  
            {{ $t('percentage must be between 0 and 100') }} 
          </span> -->
          <span class="error-message-inputs" v-if="
    percentageValue !== null &&
    (percentageValue < 0 ||
      percentageValue > 100 ||
      typeof percentageValue === 'string')
  ">  
            {{ $t('percentage must be between 0 and 100') }} 
          </span>
        </div>
      </div>

      <div class="dialog-footer">
        <button class="btn btn-primary" :disabled="isInputEmpty" @click="handleSave">
          {{ isEdit ? $t('save') : $t('add') }}
        </button>
        <button v-if="isEdit" class="btn btn-secondary" @click="resetForm">
          {{ $t('cancel') }}
        </button>
        <button class="btn btn-secondary" @click="dialogVisible = false">
          {{ $t('close') }}
        </button>
      </div>
    </div>
  </Dialog>
</template>

<style scoped lang="scss">
  .error-message-inputs{
    color: red;
    font-family: "medium";
  }
  .dialog-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .document-type-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    background-color: var(--color-light-gray);
  }
  .item-title {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .item-small-title {
    font-size: 0.7rem;
    color: var(--bread-crumb-color-span);
  }
  .item-main-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: black;
  }
  .item-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  .field-input {
    background-color: var(--bg-main);
    border-radius: 30px;
    margin: 0 !important;

    ::placeholder {
      color: var(--bread-crumb-color-span);
    }
  }
  .dialog-inputs {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 15px;
    .field-group {
      &:first-child {
        width: 60%;
      }
      &:last-child {
        width: 40%;
      }
    }
  }
  .dialog-footer {
    display: flex;
    gap: 0.5rem;
  }
</style>
