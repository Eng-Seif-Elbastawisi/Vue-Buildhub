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

<style scoped lang="scss">
  .feature-header-container.feature-header-container {
    --quote-copper-soft: var(--PrimaryColor-light);
    --quote-copper-dark: var(--PrimaryColor);

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    min-height: 112px;
    margin-block: 1rem 1.5rem;
    padding: 1.5rem 1.75rem;
    overflow: visible;
    color: var(--secondary-text-color, var(--white));
    background: var(--SecondaryColor);
    border: 1px solid
      color-mix(in sRGB, var(--SecondaryColor), var(--secondary-text-color, var(--white)) 20%);
    border-radius: var(--radius-md, 14px);
    box-shadow: none;
    animation: none;

    &::after,
    .header-img {
      display: none;
    }

    > .content {
      display: flex;
      flex: 1;
      flex-direction: row;
      align-items: center;
      gap: 1.25rem;
      min-width: 0;
      padding: 0;
      background: transparent;
      animation: none;
    }

    .standard-form-header-copy {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 0;
      text-align: start;
    }

    .title {
      margin: 0;
      color: var(--secondary-text-color, var(--white));
      font-size: clamp(1.5rem, 2.4vw, 2.2rem);
      font-weight: 700;
      line-height: 1.25;
      text-transform: none;
      text-wrap: balance;
      overflow-wrap: anywhere;
      animation: none;
    }

    .standard-form-header-description {
      max-width: 65ch;
      margin: 0;
      color: var(--secondary-text-color, var(--white));
      font-size: 1rem;
      line-height: 1.5;
      text-transform: none;
      overflow-wrap: anywhere;
      animation: none;
    }

    .standard-form-header-icon {
      display: grid;
      flex: 0 0 64px;
      place-items: center;
      width: 64px;
      height: 64px;
      color: color-mix(in sRGB, var(--PrimaryColor), var(--secondary-text-color, var(--white)) 65%);
      background: color-mix(
        in sRGB,
        var(--SecondaryColor),
        var(--secondary-text-color, var(--white)) 10%
      );
      border: 1px solid var(--PrimaryColor);
      border-radius: var(--radius-md, 14px);
      animation: none;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      min-width: 0;

      &:empty {
        display: none;
      }
    }

    :deep(.btn) {
      min-height: 44px;
      font-size: 0.85rem;
      text-transform: none;
      transition:
        background-color 180ms ease,
        border-color 180ms ease;
    }

    :deep(.btn-primary) {
      color: var(--button-primary-color, var(--white));
      background: var(--PrimaryColor);
      border: 1px solid var(--PrimaryColor);
      box-shadow: none;
    }

    :deep(.btn-primary:hover:not(:disabled)) {
      background: color-mix(in sRGB, var(--PrimaryColor), var(--SecondaryColor) 15%);
    }

    :deep(.btn-secondary) {
      color: var(--secondary-text-color, var(--white));
      background: transparent;
      border: 1px solid
        color-mix(in sRGB, var(--secondary-text-color, var(--white)), var(--SecondaryColor) 25%);
      box-shadow: none;
    }

    :deep(.btn-secondary:hover:not(:disabled)) {
      background: color-mix(
        in sRGB,
        var(--SecondaryColor),
        var(--secondary-text-color, var(--white)) 10%
      );
    }

    :deep(:is(a, button):focus-visible) {
      outline: 2px solid var(--PrimaryColor);
      outline-offset: 4px;
    }

    &::selection,
    :deep(::selection) {
      color: var(--SecondaryColor);
      background: color-mix(
        in sRGB,
        var(--PrimaryColor),
        var(--secondary-text-color, var(--white)) 65%
      );
    }
  }

  @media (max-width: 680px) {
    .feature-header-container.feature-header-container {
      flex-direction: column;
      align-items: stretch;
      gap: 1.25rem;
      min-height: 0;
      padding: 1.25rem;

      > .content {
        align-items: flex-start;
        gap: 0.875rem;
      }

      .title {
        font-size: 1.5rem;
      }

      .standard-form-header-description {
        font-size: 0.88rem;
      }

      .standard-form-header-icon {
        flex-basis: 48px;
        width: 48px;
        height: 48px;
      }

      .actions {
        justify-content: flex-start;
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .feature-header-container.feature-header-container :deep(.btn) {
      transition: none;
    }
  }
</style>
