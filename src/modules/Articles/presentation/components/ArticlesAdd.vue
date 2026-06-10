<script setup lang="ts">
  import { ref } from 'vue';
  import IconAccept from '@/shared/icons/IconAccept.vue';
  import { useRoute } from 'vue-router';
  import type AddEmployeeParams from '../../core/params/add.Artical.params';
  import ArticleController from '../controllers/Article.controller';
  import ArticleForm from './ArticleForm.vue';
  import LoadingIcon from '@/assets/images/loading.webp';
import router from '@/router/index.ts';

  const controller = ArticleController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;

  const params = ref<AddEmployeeParams | null>(null);

  /**
   * Save new article
   */

  const loading = ref(false);
  // save as draft 
  const saveAsDraft = async () => {
    loading.value = true;
    try {
      if (!params.value) {
        console.error('No article parameters to save');
        return;
      }

      localStorage.setItem(`article-draft`, JSON.stringify(params.value));
      router.push({ name: 'Articles' });
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      loading.value = false;
    }
  };

  const saveArticle = async () => {
    try {
      if (!params.value) {
        console.error('No article parameters to save');
        return;
      }
      loading.value = true;
      await controller.create(params.value, undefined, formKey);
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      loading.value = false;
    }
  };

  const updateData = (updatedParams: AddEmployeeParams) => {
    params.value = updatedParams;
  };
</script>

<template>
  <div class="artical-add-page">
    <!-- <ArticleForm :form-key="formKey" :loading="loading" @update-data="updateData" /> -->
     <ArticleForm
  :form-key="formKey"
  :loading="loading"
  @update-data="updateData"
/>

    <div class="actions" :class="{ disabled: loading }">
      <!-- <AppButton  title="Save Article" size="sm" icon="right" type="submit" class="save-emp"  :class="{ disabled: loading }" @click="saveArticle">
        <template #icon>
   
           <img
          v-if="loading"
          :src="LoadingIcon"
          class="loader-skills"
          alt="loading"
          width="30"
          height="30"
        />
          <IconAccept v-else />
        </template>
        <span v-if="!loading" >{{ $t(`Save Article`) }}</span>
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
      <!-- <button class="btn btn-draft">{{ $t(`Save As draft`) }}</button> -->
        <button
        class="btn btn-draft"
        :disabled="loading"
        :class="loading ? 'disabled' : ''"
        @click="saveAsDraft"
      >
        {{ $t(`Save As draft`) }}
      </button>
      <button class="btn btn-cancel">{{ $t(`cancel`) }}</button>
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

  //
  .btn-cancel {
    background-color: var(--background-btn-outline-color);
    color: var(--danger-color);
    border: 1px solid rgba(245, 194, 192, 1);
    border-radius: 50px;
    width: 20%;

    @media (max-width: 768px) {
      width: 50%;
    }
  }

  .btn-draft {
    background-color: var(--PrimaryColor-alpha-10);
    color: var(--PrimaryColor);
    border: 1px solid var(--PrimaryColor-alpha-10);
    border-radius: 50px;
    width: 20%;

    @media (max-width: 768px) {
      width: 50%;
    }
  }

  .save-btn {
    width: 60%;
    background-color: var(--primary-green);
    color: white;

    @include flex(wrap, row, center, center);

    border-radius: 50px;
    border: none;
  }

  .actions {
    margin-top: 24px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
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