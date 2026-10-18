<script setup lang="ts">
  import type { MenuItem } from 'primevue/menuitem';
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';
  import {
    buildBreadcrumb,
    type BreadcrumbItem,
  } from '../LayoutComponents/SubComponents/RouteHelper';
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

<style scoped lang="scss">
  @use 'workspace-glass' as glass;

  .feature-header-container.page-header--animated {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--bh-space-6);
    width: 100%;
    min-width: 0;
    min-height: 112px;
    margin: var(--bh-space-5) auto var(--bh-space-6);
    padding: var(--bh-space-6);
    overflow: visible;
    border-radius: var(--bh-radius-card);
    color: var(--bh-text);
    box-shadow: none;

    @include glass.surface;

    &::after {
      display: none;
    }

    > .content {
      display: flex;
      flex: 1;
      align-items: center;
      flex-direction: row;
      gap: var(--bh-space-4);
      min-width: 0;
      padding: 0;
      background: transparent;
    }

    .standard-form-header-copy {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
      text-align: start;
    }

    .title {
      margin: 0;
      color: var(--bh-text);
      font-size: var(--bh-text-page);
      font-family: var(--bh-font);
      font-weight: 700;
      line-height: 1.2;
      text-transform: none;
      overflow-wrap: anywhere;
    }

    .standard-form-header-description {
      max-width: 65ch;
      margin: 0;
      color: var(--bh-muted);
      font-size: var(--bh-text-sm);
      line-height: 1.5;
      text-transform: none;
    }

    .standard-form-header-icon {
      display: grid;
      flex: 0 0 var(--bh-control-height);
      place-items: center;
      width: var(--bh-control-height);
      height: var(--bh-control-height);
      color: var(--bh-blue-ink);
      background: color-mix(in sRGB, var(--bh-surface-raised) 65%, var(--bh-blue-soft));
      border: 0;
      border-radius: var(--bh-radius-control);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      min-width: 0;

      &:empty {
        display: none;
      }
    }
  }

  @media (max-width: 767px) {
    .feature-header-container.page-header--animated {
      flex-direction: column;
      align-items: stretch;
      min-height: 0;
      gap: var(--bh-space-4);
      padding: var(--bh-space-5) var(--bh-space-4);

      .actions {
        justify-content: start;
        width: 100%;

        > :deep(.btn),
        > :deep(button),
        > :deep(a) {
          flex: 1 1 auto;
          justify-content: center;
        }
      }
    }
  }
</style>
