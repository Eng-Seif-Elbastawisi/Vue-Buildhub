<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import Dialog from 'primevue/dialog';
  import RenameIcon from '@/assets/images/RenameImage.png';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import TranslationParams from '@/modules/about/core/params/translation.params';
  import EducationSubjectItemController from '../presentation/controllers/educationSubject/education.subject.item.controller';
  import EditEducationSubjectItemParams from '../core/params/EducationSubjects/edit.education.subject.item.params';

  const props = defineProps<{
    visable: boolean;
    itemId: number;
    stageId: number;
  }>();

  const controller = EducationSubjectItemController.getInstance();

  const emit = defineEmits(['update:visable', 'update:name']);

  const visible = computed({
    get: () => props.visable,
    set: (val) => emit('update:visable', val),
  });

  const title = ref<Record<string, string>>({});

  const CloseDialog = () => {
    visible.value = false;
  };

  const EditData = async () => {
    visible.value = false;

    await controller.update(
      new EditEducationSubjectItemParams({
        subject_id: props.itemId,
        branch_id: props.stageId,
        translations: new TranslationParams({
          title: title.value,
        }),
      }),
    );
    emit('update:name');
  };
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :modal="true"
    :pt="{
      root: 'rename-dialog',
      header: 'dialog-header',
      content: 'dialog-body',
    }"
    :style="{ width: '35rem' }"
  >
    <template #header>
      <div class="header-container">
      
        <img :src="RenameIcon" class="icon-dialog" alt="rename-image" />
        <div class="header-text-content">
          <h4 class="header-title">{{ $t('rename_title_of_education_classifications') }}</h4>
          <p class="header-message">
            {{
              $t(
                'Enter_a_new_name_for_this_education_classifications_This_change_will_not_affect_its_content_or_structure',
              )
            }}
          </p>
        </div>
      </div>
    </template>
    <div class="content">
      <div class="input-wrap">
        <MultiLangInput
          :field-key="`title`"
          :label="$t(`education classification`)"
          :languages="['en', 'ar']"
          :model-value="title"
          :type="`title`"
          @update:model-value="title = $event"
        />
      </div>
      <div class="btns">
        <button class="btn btn-primary w-full" @click="EditData">{{ $t('save') }}</button>
        <button class="btn btn-secondary w-full" @click="CloseDialog">{{ $t('cancel') }}</button>
      </div>
    </div>
  </Dialog>
</template>
