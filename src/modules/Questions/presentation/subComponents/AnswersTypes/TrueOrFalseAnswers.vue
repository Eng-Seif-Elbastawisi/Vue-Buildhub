<script setup lang="ts">
  import HandleFilesUpload from '@/shared/FormInputs/HandleFilesUpload.vue';
  import UploadFileIcon from '@/shared/icons/UploadFileIcon.vue';
  import { onMounted, ref, watch } from 'vue';
  import Checkbox from 'primevue/checkbox';
  import AnswerModel from '@/modules/Questions/core/models/subModels/answer.model';
  import AnswersParams from '@/modules/Questions/core/params/subParams/answers.params';
  import AttachmentsParams from '@/modules/Questions/core/params/subParams/attachments.params';

  const emit = defineEmits(['update:data']);
  const { questionData, draftData } = defineProps<{
    questionData: AnswerModel[];
    draftData?: AnswersParams[];
  }>();

  const Answers = ref<AnswerModel[]>([
    {
      answer: '',
      is_right_answer: false,
      image: [new AttachmentsParams({ file: '' })],
    },
    {
      answer: '',
      is_right_answer: false,
      image: [new AttachmentsParams({ file: '' })],
    },
  ]);

  const UpdateData = () => {
    emit(
      'update:data',
      Answers.value.map((el: AnswerModel) => {
        return new AnswersParams({
          title: el.answer,
          file: el.image
            ? [
                new AttachmentsParams({
                  alt: el.image[0]?.alt || '',
                  file: el.image[0]?.file,
                }),
              ]
            : [],
          isCorrect: el.is_right_answer,
        });
      }),
    );
  };

  onMounted(() => {
    emit(
      'update:data',
      Answers.value.map((el: AnswerModel) => {
        return new AnswersParams({
          title: el.answer,
          file: el.image
            ? [
                new AttachmentsParams({
                  alt: el.image[0]?.alt || '',
                  file: el.image[0]?.file,
                }),
              ]
            : [],
          isCorrect: el.is_right_answer,
        });
      }),
    );
  });

  const setImage = (files: any[], index: number) => {
    Answers.value[index]!.image = files[0]?.base64
      ? [new AttachmentsParams({ file: files[0]?.base64 as string })]
      : [];
    UpdateData();
  };

  // const getImageUrls = (image: AnswerModel['image']): string[] =>
  //   (image?.map((img: AttachmentModel) => img.file).filter(Boolean) as string[]) ?? [];

  const setCorrect = (index: number) => {
    Answers.value.map((item) => {
      item.is_right_answer = false;
    });
    Answers.value[index]!.is_right_answer = true;
    UpdateData();
  };
  watch(
    () => questionData,
    (newValue) => {
      if (newValue && newValue.length > 0) {
        Answers.value = newValue.map((item) => ({
          answer: item.answer,
          image: item.image ?? null,
          is_right_answer: item.is_right_answer,
        }));
      }
      UpdateData();
    },
    { immediate: true, deep: true },
  );

  watch(
    () => draftData,
    (newValue) => {
      if (newValue && newValue.length > 0) {
        Answers.value = newValue.map((item) => ({
          answer: item.title ?? '',
          is_right_answer: item.isCorrect ?? false,
          image: item.file?.length
            ? [new AttachmentsParams({ file: item.file[0]?.file })]
            : [new AttachmentsParams({ file: '' })],
        }));
      }
    },
  );
</script>

<template>
  <div class="true-false-answers-time-line-container">
    <div
      v-for="(item, index) in Answers"
      :key="index"
      class="timeline-item"
      :style="{ animationDelay: `${index * 0.15}s` }"
    >
      <div class="timeline-content">
        <div class="timeline-form-content">
          <div class="field-group">
            <label class="field-label" :for="`answer-${index}`">{{ $t(`answer`) }}</label>
            <div class="input-wrap">
              <input
                :id="`answer-${index}`"
                v-model="item.answer"
                type="text"
                :placeholder="$t('add_your_answer')"
                class="field-input"
                @input="UpdateData"
              />
            </div>
            <div class="files-input" :class="{ haveImage: item.image }">
              <HandleFilesUpload
                :label="``"
                accept="image/*"
                :multiple="true"
                :index="index + 5"
                :file="item.image?.map((img) => img.file).filter(Boolean) as string[]"
                :have-content="true"
                :class="`image-input`"
                @change="(files) => setImage(files, index)"
              >
                <template #content>
                  <UploadFileIcon />
                </template>
              </HandleFilesUpload>
            </div>
          </div>

          <div class="is-correct-section">
            <label :for="`is-correct-${index}`">{{ $t('correct answer') }}</label>
            <Checkbox
              :binary="true"
              :model-value="item.is_right_answer"
              :input-id="`is-correct-${index}`"
              name="is-correct"
              :value="item.is_right_answer"
              @change="setCorrect(index)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
