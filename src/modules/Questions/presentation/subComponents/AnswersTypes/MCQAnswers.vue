<script setup lang="ts">
  import HandleFilesUpload from '@/shared/FormInputs/HandleFilesUpload.vue';
  import DeletIcon from '@/shared/icons/DropListIcons/DeletIcon.vue';
  import UploadFileIcon from '@/shared/icons/UploadFileIcon.vue';
  import { onMounted, ref, watch } from 'vue';
  import Checkbox from 'primevue/checkbox';
  import AddNewAnswerIcon from '@/shared/icons/AddNewAnswerIcon.vue';
  import type AnswerModel from '@/modules/Questions/core/models/subModels/answer.model';
  import AnswersParams from '@/modules/Questions/core/params/subParams/answers.params';
  import AttachmentsParams from '@/modules/Questions/core/params/subParams/attachments.params';

  type LocalAnswer = Omit<AnswerModel, 'image'> & { image?: string };

  const emit = defineEmits(['update:data']);
  const { questionData, draftData } = defineProps<{
    questionData: AnswerModel[];
    draftData: AnswersParams[];
  }>();

  const Answers = ref<LocalAnswer[]>([
    {
      answer: '',
      is_right_answer: false,
      image: '',
    },
  ]);

  const addNewAnswer = () => {
    Answers.value.push({ answer: '', is_right_answer: false, image: '' });

    UpdateData();
  };

  const DeleteItem = (index: number) => {
    Answers.value.splice(index, 1);
    UpdateData();
  };

  const UpdateData = () => {
    emit(
      'update:data',
      Answers.value.map((el: LocalAnswer) => {
        return new AnswersParams({
          title: el.answer,
          file: el.image
            ? [
                new AttachmentsParams({
                  alt: el.image,
                  file: el.image,
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
      Answers.value.map((el: LocalAnswer) => {
        return new AnswersParams({
          title: el.answer,
          file: el.image
            ? [
                new AttachmentsParams({
                  alt: el.image,
                  file: el.image,
                }),
              ]
            : [],
          isCorrect: el.is_right_answer,
        });
      }),
    );
  });

  const setImage = (files: any[], index: number) => {
    Answers.value[index]!.image = files[0]?.base64 ? (files[0]?.base64 as string) : '';
    UpdateData();
  };

  const setCorrect = (index: number) => {
    Answers.value.map((item) => {
      item.is_right_answer = false;
    });
    Answers.value[index]!.is_right_answer = true;
    UpdateData();
  };

  watch(
    () => questionData,
    (newvalue) => {
      if (newvalue && newvalue.length > 0) {
        Answers.value = newvalue.map((item) => ({
          ...item,
          image: item.image?.[0]?.file || '',
        }));
      }
      UpdateData();
    },
    {
      deep: true,
      immediate: true,
    },
  );
  watch(
    () => draftData,
    (newvalue) => {
      if (newvalue && newvalue.length > 0) {
        Answers.value = newvalue.map((item) => ({
          answer: item.title,
          file: item.file,
          is_right_answer: item.isCorrect,
        }));
      }
      UpdateData();;
    },
    {
      deep: true,
      immediate: true,
    },
  );
</script>

<template>
  <div class="mcq-answers-time-line-container">
    <div
      v-for="(item, index) in Answers"
      :key="index"
      class="timeline-item"
      :style="{ animationDelay: `${index * 0.15}s` }"
    >
      <div class="timeline-content">
        <div class="timeline-form-content" :class="{ 'without-delete': Answers.length === 1 }">
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
                :file="item.image"
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
          <div v-if="Answers.length > 1" class="delete-icon-container">
            <button type="button" class="delete-btn" @click="DeleteItem(index)">
              <DeletIcon />
            </button>
          </div>
        </div>
      </div>

      <div v-if="Answers.length - 1 == index" class="add-row" @click="addNewAnswer">
        <div class="add-icon">
          <AddNewAnswerIcon />
          <span class="add-text">{{ $t('add_another_answer') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
