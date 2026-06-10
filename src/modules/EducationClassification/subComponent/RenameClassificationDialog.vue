<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import Dialog from 'primevue/dialog';
  import RenameIcon from '@/assets/images/RenameImage.png';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import TranslationParams from '@/modules/about/core/params/translation.params';
  import { useRoute } from 'vue-router';
  import EducationStageController from '../presentation/controllers/EducationStages/education.stages.controller';
  import EditEducationStageParams from '../core/params/EducationStages/edit.education.stage.params';
  import FetchEducationStageParams from '../core/params/EducationStages/fetch.education.stage.params';

  const props = defineProps<{
    visable: boolean;
    itemId: number;
    parentId: number;
  }>();
  const controller = EducationStageController.getInstance();

  const emit = defineEmits(['update:visable', 'update:name']);

  const visible = computed({
    get: () => props.visable,
    set: (val) => emit('update:visable', val),
  });

  const title = ref<Record<string, string>>({});

  const CloseDialog = () => {
    visible.value = false;
  };

  const route = useRoute();
  const EditData = async () => {
    visible.value = false;

    await controller.update(
      new EditEducationStageParams({
        branchId: Number(props.itemId),
        translations: new TranslationParams({
          title: title.value,
        }),
        classification_id: Number(route.params.id),
      }),
    );
    await controller.fetchList(
      new FetchEducationStageParams({
        parent_id: props.parentId,
        classification_id: Number(route.params.id),
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
        <!-- <input
          id="title"
          v-model="title"
          type="text"
          :placeholder="$t('Enter education type')"
          class="field-input"
        /> -->
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
        <button class="btn btn-primary w-full" @click="EditData">save</button>
        <button class="btn btn-secondary w-full" @click="CloseDialog">cancel</button>
      </div>
    </div>
  </Dialog>
</template>
