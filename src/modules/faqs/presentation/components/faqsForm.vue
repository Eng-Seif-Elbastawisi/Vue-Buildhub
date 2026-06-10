<script setup lang="ts">
  import { ref, watch } from 'vue';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import type FaqsModel from '../../core/models/faqs.model';
  import FaqDetailsIcon from '@/shared/icons/faqs/FaqDetailsIcon.vue';
  import AddFaqsParams from '../../core/params/add.faqs.params';
  import TranslationParams from '@/modules/about/core/params/translation.params';
  import { useRoute } from 'vue-router';
  import EditFaqsParams from '../../core/params/edit.faqs.params';

  const props = defineProps<{
    faq?: FaqsModel;
    loading?: boolean;
  }>();

  const emit = defineEmits<{
    // (e: 'updateData', value: AddFaqsParams): void;
    (e: 'updateData', value: AddFaqsParams | EditFaqsParams): void;
  }>();

  const question = ref<Record<string, string>>({});
  const answer = ref<Record<string, string>>({});

  const route = useRoute();
  const emitData = () => {
    if (route.params.id) {
      emit(
        'updateData',
        new EditFaqsParams({
          id: Number(route.params.id),
          translations: new TranslationParams({
            question: question.value,
            answer: answer.value,
          }),
        }),
      );
    } else {
      emit(
        'updateData',
        new AddFaqsParams({
          translations: new TranslationParams({
            question: question.value,
            answer: answer.value,
          }),
        }),
      );
    }
  };

  watch(
    () => props.faq,
    (faq) => {
      if (faq) {
        question.value = faq.question as Record<string, string>;
        answer.value = faq.answer as Record<string, string>;
        emitData();
      }
    },
    { immediate: true },
  );

  const reset = () => {
    question.value = {};
    answer.value = {};
    emitData();
  };
</script>

<template>
  <div class="faq-form-card">
    <div class="faq-form-header">
      <div class="form-header-left">
        <FaqDetailsIcon />
        <span class="form-title">{{ $t('faq_details') }}</span>
      </div>
      <button type="button" class="reset-btn" @click="reset">{{ $t('reset') }}</button>
    </div>

    <div class="faq-form-fields">
      <div class="field-group" :class="{ disabled: props.loading }">
        <MultiLangInput
          field-key="question"
          :label="$t('question')"
          :languages="['en', 'ar']"
          :type="`title`"
          :model-value="question"
          :placeholder="$t('enter_question')"
          @update:model-value="
            question = $event;
            emitData();
          "
        />
      </div>

      <div class="field-group" :class="{ disabled: props.loading }">
        <MultiLangInput
          field-key="answer"
          :label="$t('answer')"
          :languages="['en', 'ar']"
          :model-value="answer"
          :type="`description`"
          :placeholder="$t('enter_answer')"
          @update:model-value="
            answer = $event;
            emitData();
          "
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .field-group {
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }
</style>
