<script setup lang="ts">
  import type { MenuItem } from 'primevue/menuitem';
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';
  import {
    buildBreadcrumb,
    type BreadcrumbItem,
  } from '../LayoutComponents/SubComponents/RouteHelper';
  import FeatureHeader from '@/assets/images/FeatureHeader.jpg';
  import PageHeaderIcon from './PageHeaderIcon.vue';
  import { getPageHeaderAction, getPageHeaderIcon } from './pageHeaderIcon';
  const route = useRoute();
  const router = useRouter();
  const { t, locale } = useI18n();

  const standardFormDetail = computed(() => {
    const [, ...parts] = route.path.split('/').filter(Boolean);
    const isAction = (part?: string) => part === 'add' || part === 'edit';
    const isNestedSubStage = parts[0] === 'stages' && parts[2] === 'sub-stages';
    const section =
      isNestedSubStage && isAction(parts[3])
        ? 'sub-stages'
        : isAction(parts[1]) && parts.length <= 3
          ? parts[0]
          : undefined;
    const action = isNestedSubStage ? parts[3] : parts[1];
    const icon = section ? getPageHeaderIcon(route.path) : undefined;
    if (!icon) return undefined;

    const descriptionKey =
      action === 'edit' ? 'standard_form.edit_description' : 'standard_form.add_description';

    return { icon, description: t(descriptionKey) };
  });

  const specializedPageIntro = computed(() => {
    switch (route.name) {
      case 'add-project':
        return {
          icon: 'project' as const,
          title: t('Project.add'),
          description: t('Project.form_description'),
        };
      case 'edit-project':
        return {
          icon: 'project' as const,
          title: t('Project.edit'),
          description: t('standard_form.edit_description'),
        };
      case 'show-project':
        return {
          icon: 'project' as const,
          title: t('ProjectShow.project_details'),
          description: t('ProjectShow.project_information_summary'),
        };
      case 'Add Execution Quote':
        return {
          icon: 'document' as const,
          title: t('execution_quote.title'),
          description: t('execution_quote.subtitle'),
        };
      default:
        return undefined;
    }
  });

  const pageIntroDetail = computed(() => specializedPageIntro.value ?? standardFormDetail.value);
  const visibleIcon = computed(() => pageIntroDetail.value?.icon ?? getPageHeaderIcon(route.path));
  const headerAction = computed(() => getPageHeaderAction(route.path));

  const items = computed(() => {
    void locale.value;
    return buildBreadcrumb(route, router);
  });

  const getLabel = (breadcrumbItem?: BreadcrumbItem | MenuItem) => {
    if (!breadcrumbItem) return '';
    if ('labelKey' in breadcrumbItem && typeof breadcrumbItem.labelKey === 'string') {
      return t(breadcrumbItem.labelKey);
    }

    return typeof breadcrumbItem.label === 'function'
      ? breadcrumbItem.label()
      : (breadcrumbItem.label ?? '');
  };
</script>

<template>
  <div
    class="feature-header-container page-header--animated"
    :class="{
      'feature-header-container--page-intro': pageIntroDetail,
      'feature-header-container--entity': visibleIcon && !pageIntroDetail,
    }"
  >
    <img class="header-img" :src="FeatureHeader" :alt="$t('feature_header_image_alt')" />
    <div :key="route.path" class="content" :class="{ 'content--standard-form': pageIntroDetail }">
      <PageHeaderIcon
        v-if="visibleIcon"
        :kind="visibleIcon"
        :action="headerAction"
        class="standard-form-header-icon"
      />
      <div v-if="visibleIcon" class="standard-form-header-copy">
        <h1 class="title page-header__title">
          {{ specializedPageIntro?.title ?? getLabel(items[items.length - 1]) }}
        </h1>
        <p
          v-if="pageIntroDetail?.description"
          class="standard-form-header-description page-header__subtitle"
        >
          {{ pageIntroDetail.description }}
        </p>
      </div>
      <h1 v-else class="title page-header__title">{{ getLabel(items[items.length - 1]) }}</h1>
    </div>
    <div class="actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<style scoped>
  .feature-header-container--entity .content {
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }

  .feature-header-container--entity .standard-form-header-copy {
    min-width: 0;
  }
</style>
