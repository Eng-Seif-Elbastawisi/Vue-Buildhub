<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';

  const props = withDefaults(
    defineProps<{
      title?: string;
      description?: string;
      link?: string;
      addText?: string;
    }>(),
    {
      title: undefined,
      description: undefined,
      link: '/',
      addText: undefined,
    },
  );

  const { t, te } = useI18n();
  const addTextValue = computed(() => props.addText ?? t('home'));
  const translateIfExists = (value?: string) => {
    if (!value) return '';

    return te(value) ? t(value) : value;
  };
</script>

<template>
  <div class="data-empty">
    <img
      :alt="$t('data_failed_image_alt')"
      class="data-empty-image"
      src="@/assets/images/app/system-failed.png"
    />
    <h2>{{ translateIfExists(props.title) }}</h2>
    <p>{{ translateIfExists(props.description) }}</p>
    <router-link :to="props.link" class="btn btn-primary">
      {{ addTextValue }}
    </router-link>
  </div>
</template>

<style scoped></style>
