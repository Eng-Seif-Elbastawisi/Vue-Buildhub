<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import IconAccept from '@/shared/icons/IconAccept.vue';
  import ArticleController from '../controllers/Article.controller';
  import EditArticlesParams from '../../core/params/edit.Articles.params';
  import ShowArticlesParams from '../../core/params/show.Articles.params';
  import LoadingIcon from '@/assets/images/loading.webp';
  import ArticleForm from './ArticleForm.vue';
  import type AddArticlesParams from '../../core/params/add.Artical.params.ts';

  const controller = ArticleController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;

  const params = ref<EditArticlesParams | null>(null);

  /**
   * Update article
   */
  const loading = ref(false);

  const saveArticle = async () => {
    if (!params.value) {
      console.error('No article parameters to save');
      return;
    }
    try {
      loading.value = true;
      await controller.update(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };

  const updateData = (updatedParams: AddArticlesParams) => {
    params.value = new EditArticlesParams({
      id: Number(route.params.id),
      question_description: updatedParams.question_description,
      attachments: updatedParams.attachments,
      question: updatedParams.question,
      question_type: updatedParams.question_type,
      e_c_subject_id: updatedParams.e_c_subject_id,
      documents: updatedParams.documents,
      explanation: updatedParams.explanation,
    });
  };

  onMounted(async () => {
    await controller.fetchOne(new ShowArticlesParams(Number(route.params.id)));
  });
</script>

<template>
  <div class="article-edit-page">
    <ArticleForm
      :loading="loading"
      :article="controller.itemData.value!"
      :form-key="formKey"
      @update-data="updateData"
    />

    <div class="actions" :class="{ disabled: loading }">
      <!-- <AppButton  title="Save Article" size="sm" icon="right" type="submit" class="save-emp" @click="saveArticle">
        <template #icon>
          <span v-if="loading" class="loader"></span>
          <IconAccept v-else />
        </template>
        <span v-if="!loading">{{ $t(`Save Article`) }}</span>
      </AppButton> -->
      <button class="save-btn" :class="{ disabled: loading }" @click="saveArticle">
        <img
          v-if="loading"
          :src="LoadingIcon"
          class="loader-skills"
          alt="loading"
          width="30"
          height="30"
        />
        <span v-else> {{ $t('Save Article') }} <IconAccept /> </span>
      </button>
    </div>

    <!-- Error Display -->
    <div v-if="controller.errorMessage.value" class="error-toast">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '../../../../styles/variables' as *;
  @use '../../../../styles/mixins/flex' as *;
  // .employee-edit-page {
  //   padding: 24px;
  //   max-width: 1000px;
  //   margin: 0 auto;
  // }

  .save-btn {
    width: 100%;
    background-color: var(--primary-green);
    color: white;

    @include flex(wrap, row, center, center);

    border-radius: 50px;
    border: none;
    padding: 10px 20px;
  }

  .loader {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 14px solid;
    border-color: black transparent black transparent;
    animation: l1 1.2s linear infinite;
    display: inline-block;
  }

  @keyframes l1 {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  .actions {
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.5;
    }
  }

  .actions {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }

  .save-emp {
    width: 100%;
    padding: 10px 20px;
  }

  .error-toast {
    margin-top: 20px;
    padding: 12px 16px;
    background-color: var(--error-light);
    color: var(--error-dark);
    border: 1px solid var(--error-border);
    border-radius: var(--radius-md);
    font-size: 0.9rem;
  }
</style>