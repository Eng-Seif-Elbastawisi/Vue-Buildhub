<script setup lang="ts">
  import { ref, computed, watch, nextTick } from 'vue';
  import Dialog from 'primevue/dialog';
  import SubjectSkllsIcon from '@/assets/images/Skills.png';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import EditeIcon from '@/shared/icons/DocaumentType/EditeIcon.vue';
  import IndexDelete from '@/shared/icons/DocaumentType/IndexDelete.vue';
  import EducationTopicsController from '../../presentation/controllers/EducationTopics/education.topics.controller';
  import IndexEducationSubjectTopicParams from '../../core/params/EducationTopic/index.education.subject.topic.params';
  import EditEducationSubjectTopicParams from '../../core/params/EducationTopic/edit.education.subject.topic.params';
  import TranslationParams from '@/modules/about/core/params/translation.params';
  import AddEducationSubjectTopicParams from '../../core/params/EducationTopic/add.education.subject.topic.params';
  import DeleteEducationSubjectTopicParams from '../../core/params/EducationTopic/delete.education.subject.topic.params';
  import ShowEducationSubjectTopicParams from '../../core/params/EducationTopic/show.education.subject.topic.params';
  import MultiLangInput from '@/shared/MultiLangInput.vue';

  const props = defineProps<{
    visible: boolean;
    level: number;
    branchName: string;
    branchId?: number;
  }>();

  const emit = defineEmits<{
    (e: 'update:visible', val: boolean): void;
  }>();

  const educationTopicsController = EducationTopicsController.getInstance();
  // const indexEducationSubjectTopicParams = new IndexEducationSubjectTopicParams({
  //   TopicId: Number(props.branchId),
  // });

  const topicsState = computed(() => educationTopicsController.listState.value);

  const isEdit = ref(false);
  const editId = ref<number | null>(null);
  const inputRef = ref<HTMLInputElement | null>(null);

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val),
  });

  watch(dialogVisible, async (val) => {
    if (val) {
      resetForm();
      await fetchTopics();
      await nextTick();
      inputRef.value?.focus();
    }
  });

  const isInputEmpty = computed(() => !title.value);

  function resetForm() {
    title.value = undefined;
  }
  const title = ref<Record<string, string>>();
  const fetchTopics = async () => {
    if (!props.branchId) return;
    await educationTopicsController.fetchList(
      new IndexEducationSubjectTopicParams({ SubjectId: props.branchId }),
    );
  };

  const handleSave = async () => {
    if (isEdit.value && editId.value !== null) {
      await educationTopicsController.update(
        new EditEducationSubjectTopicParams({
          entryId: editId.value,
          educationClassificationSubjectId: props.branchId!,
          translations: new TranslationParams({
            title: title.value,
          }),
        }),
      );
    } else if (props.branchId) {
      await educationTopicsController.create(
        new AddEducationSubjectTopicParams({
          id: props.branchId,
          translations: new TranslationParams({
            title: title.value,
          }),
        }),
      );
    }
    await fetchTopics();
    resetForm();
  };

  const deleteTopic = async (id: number) => {
    await educationTopicsController.delete(new DeleteEducationSubjectTopicParams({ entryId: id }));
    await fetchTopics();
  };

  const showDetails = async (id: number) => {
    isEdit.value = true;
    editId.value = id;
    const res = await educationTopicsController.fetchOne(
      new ShowEducationSubjectTopicParams({ entryId: id }),
    );
    if (res?.data) {
      if (res.data.titles) {
        title.value = res.data.titles;
      }
    }
  };
  const updatetitle = (newTitle: Record<string, string>) => {
    title.value = newTitle;
  };
  const CloseDialog = () => {
    isEdit.value = false;
    editId.value = null;
    resetForm();
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
        <h3 class="dialog-title">{{ $t('topics') }}</h3>
        <p class="dialog-subtitle">
          {{ $t('Define and manage topics within the system.') }}
        </p>
      </div>
    </template>

    <div class="dialog-content">
      <div v-for="(item, index) in topicsState.data" :key="index" class="document-type-row">
        <div class="item-title">
          <span class="item-small-title">{{ $t('skill') }}</span>
          <span class="item-main-title">{{ item.title }}</span>
        </div>
        <div class="item-actions">
          <EditeIcon @click="showDetails(item.id)" />
          <DeleteDialog
            :title="$t('Are you sure you want to remove this topic?')"
            :message="$t('This action cannot be undone.')"
            :hasbtn="true"
            @delete="deleteTopic(item.id)"
          >
            <template #btn>
              <IndexDelete />
            </template>
          </DeleteDialog>
        </div>
      </div>

      <div class="dialog-inputs">
        <div class="field-group">
          <MultiLangInput
            :field-key="`title`"
            :label="$t(`title`)"
            :languages="['en', 'ar']"
            :model-value="title"
            :type="`title`"
            @update:model-value="updatetitle"
          />
        </div>
      </div>

      <div class="dialog-footer">
        <button class="btn btn-primary" :disabled="isInputEmpty" @click="handleSave">
          {{ isEdit ? $t('save') : $t('add') }}
        </button>
        <button v-if="isEdit" @click="CloseDialog" class="btn btn-secondary">
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
  .dialog-inputs {
    width: 100%;
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
    gap: 5px;
    .field-group {
      &:first-child {
        width: 100%;
      }
    }
  }
  .dialog-footer {
    display: flex;
    gap: 0.5rem;
  }
</style>
