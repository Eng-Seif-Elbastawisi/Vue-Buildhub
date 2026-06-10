<script setup lang="ts">
  import Accordion from 'primevue/accordion';
  import AccordionPanel from 'primevue/accordionpanel';
  import AccordionHeader from 'primevue/accordionheader';
  import AccordionContent from 'primevue/accordioncontent';
  import Checkbox from 'primevue/checkbox';
  import { ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import HandleFilesUpload from '@/shared/FormInputs/HandleFilesUpload.vue';
  import UploadFileIcon from '@/shared/icons/UploadFileIcon.vue';
  import SolutionStepsParams from '../../core/params/subParams/soluation.steps.params';
  import type SolutionHintModel from '../../core/models/subModels/solution.hint.model';
  import AttachmentsParams from '../../core/params/subParams/attachments.params';
  import type AddquestionsParams from '../../core/params/add.question.params';

  const route = useRoute();
  const emit = defineEmits(['updateData']);
  const { SolutionHintsData, isSolutionHintsData, draftData } = defineProps<{
    SolutionHintsData: SolutionHintModel;
    isSolutionHintsData: boolean;
    draftData?: AddquestionsParams;
  }>();

  const updateData = () => {
    emit('updateData', {
      isSolutionHints: isSolutionSteps.value,
      data: new SolutionStepsParams({
        image: Array.isArray(file.value)
          ? file.value?.map(
              (f: any) =>
                new AttachmentsParams({
                  alt: 'solution hints image',
                  file: f,
                }),
            )
          : [],
        explanation: description.value,
      }),
    });
  };

  const isSolutionSteps = ref(isSolutionHintsData);
  const description = ref('');
  const file = ref();
  // const handleFile = (f: any) => {
  //   file.value = f[0]?.base64 ? [f[0].base64] : [];
  //   updateData();
  // };
  const handleFile = (f: any) => {
  // ✅ map على كل الصور مش أول واحدة بس
  file.value = f
    .filter((item: any) => item?.base64)
    .map((item: any) => item.base64);
  updateData();
};

  watch(
    [() => SolutionHintsData, () => isSolutionHintsData],
    ([newSolutionHinrdata, newIsSolution]) => {
      isSolutionSteps.value = newIsSolution || !!newSolutionHinrdata;
      description.value = newSolutionHinrdata?.hint;
      // file.value = newSolutionHinrdata?.attachments[0]?.file;
      file.value = newSolutionHinrdata?.attachments?.map((a: any) => a.file).filter(Boolean) ?? [];

      updateData();
    },
    { immediate: true, deep: true },
  );

  watch(
    () => draftData,
    () => {
      if (route.params.id) return;
      isSolutionSteps.value = !!draftData?.isSolutionHint || !!draftData?.solutionHint?.explanation;
      description.value = draftData?.solutionHint?.explanation ?? '';
      file.value = draftData?.solutionHint?.image?.map((f) => f.file as string) ?? [];
      updateData();
    },
    // { immediate: true, deep: true },
  );
  const accordionTransition = {
    enterFromClass: 'accordion-enter-from',
    enterActiveClass: 'accordion-enter-active',
    enterToClass: 'accordion-enter-to',
    leaveFromClass: 'accordion-leave-from',
    leaveActiveClass: 'accordion-leave-active',
    leaveToClass: 'accordion-leave-to',
  };
  const removeFilePreview = (idx: number) => {
    file.value = (file.value as string[]).filter((_: string, i: number) => i !== idx);
    updateData();
  };
</script>

<template>
  <Accordion
    :pt="{
      root: `question-solution-hints ${isSolutionSteps ? 'active' : ''}`,
      panel: 'accordion-panel',
    }"
    :value="isSolutionSteps ? 1 : 0"
    @update:value="isSolutionSteps = !isSolutionSteps"
  >
    <AccordionPanel :value="1">
      <AccordionHeader>
        <template #toggleicon>
          <div class="question-solution-hints-header">
            <div>{{ $t('Is there any hints for solution?') }}</div>
            <Checkbox
              v-model="isSolutionSteps"
              :binary="true"
              :input-id="`is-correct`"
              name="is-correct"
            />
          </div>
        </template>
      </AccordionHeader>
      <AccordionContent
        :pt="{
          root: 'accordion-content-root',
          content: 'accordion-content-inner',
          transition: accordionTransition,
        }"
      >
        <div class="input-wrapper">
          <label for="descreption">{{ $t('Description') }}</label>
          <div class="description-container">
            <div class="description-header">
              <span>B / U</span>
              <HandleFilesUpload
                :label="``"
                accept="image/*"
                :multiple="true"
                :index="40"
                :have-content="true"
                :class="`image-input`"
                :file="file"
                @change="(files) => handleFile(files)"
                :hidepreview="true"
              >
                <template #content>
                  <div class="upload-attachment-container">
                    <UploadFileIcon />
                    <span class="upload-attachment">{{ $t('upload_attachment') }}</span>
                  </div>
                </template>
              </HandleFilesUpload>
            </div>
            <textarea
              id="descreption"
              v-model="description"
              name="descreption"
              @input="updateData"
              placeholder="type hints for solution text"
            ></textarea>

            <div class="preview-container">
              <div v-if="file?.length" class="preview-grid">
                <div class="preview-item">
                  <img :src="file" class="preview-thumb" alt="attachment" />
                  <button
                    type="button"
                    class="remove-btn"
                    title="Remove"
                    @click.stop="removeFilePreview(0 as number)"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionPanel>
  </Accordion>
</template>

<style scoped lang="scss">
  @use '../../../../styles/variables' as *;
  @use '../../../../styles/mixins/flex' as *;
  .preview-container {
    width: 100%;
    border-top: 1px solid rgba(128, 128, 128, 0.353);
  }
  textarea {
    min-height: 150px;
    width: 100%;
    &::placeholder {
      font-weight: 400;
      font-family: 'Light';
    }
  }

  .accordion-enter-active,
  .accordion-leave-active {
    display: grid;
    transition: grid-template-rows 0.3s ease;
  }

  .accordion-enter-from,
  .accordion-leave-to {
    grid-template-rows: 0fr;
    transform: translateY(-50%);
    opacity: 0;
  }

  .accordion-enter-to,
  .accordion-leave-from {
    grid-template-rows: 1fr;
    transform: translateY(0);
    opacity: 1;
  }

  .accordion-content-inner {
    min-height: 0;
    transition: all 0.3s linear;
  }

  .question-solution-hints {
    border: 1px solid $PrimaryColor;
    border-radius: 50px;
    padding: 10px !important;
    margin-block: 20px !important;
    &.active {
      border-radius: 12px;
    }
    .p-accordionheader {
      padding: 5px 0 !important;
    }
    .p-accordioncontent-content {
      padding: 10px !important;
    }

    .question-solution-hints-header {
      @include flex-row(nowrap, space-between, center);
      gap: 10px;
      width: 100%;
      color: $PrimaryColor;
      padding: 0 !important;
    }

    .form-group {
      padding: 0;
    }
    .input-wrapper {
      @include flex-column(nowrap, flex-start, stretch);
      gap: 5px;
      width: 100%;
      padding: 0 !important;
      .description-container {
        width: 100%;
        border: 1px solid #e6e6e6;
        border-radius: 12px;

        .description-header {
          background-color: #e6e6e6;
          width: 100%;
          border-radius: 12px 12px 0 0;
          padding: 10px;
          color: #000000;
          @include flex-row(nowrap, space-between, center);
        }
        textarea {
          background-color: white !important;
          padding: 10px;
          border: 1px solid #848484;
          width: 100%;
          border: none;
          &:active,
          &:focus {
            border: none;
            outline: none;
            box-shadow: none;
          }
        }
      }
    }
    .image-input {
      :deep(.upload-area) {
        padding: 10px !important;
        border-radius: 50px;
        background-color: white;
      }
      .upload-attachment-container {
        @include flex-row(nowrap, flex-start, center);
        gap: 10px;
        .upload-attachment {
          color: $PrimaryColor;
        }
      }
    }

    .preview-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 10px;
    }

    .preview-item {
      position: relative;
      width: 100px;
      height: 100px;
      border-radius: 8px;
      border: 1px solid var(--gray-200);
      overflow: hidden;
      background: var(--gray-100);
      flex-shrink: 0;
      transition:
        border-color 0.15s,
        transform 0.15s;

      &:hover {
        border-color: $PrimaryColor;
        transform: translateY(-2px);
      }

      &:hover .remove-btn {
        opacity: 1;
      }
    }

    .preview-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .remove-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: none;
      background: var(--black-alpha-45);
      color: var(--BgWhite);
      font-size: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition:
        opacity 0.15s,
        background 0.15s;
      z-index: 10;

      &:hover {
        background: var(--danger);
      }
    }

    .image-input {
      :deep(.upload-area) {
        padding: 10px !important;
        border-radius: 50px;
        background-color: white;
      }

      .upload-attachment-container {
        @include flex-row(nowrap, flex-start, center);
        gap: 10px;

        .upload-attachment {
          color: $PrimaryColor;
        }
      }
    }
  }
</style>
