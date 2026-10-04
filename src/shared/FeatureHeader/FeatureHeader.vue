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
  const route = useRoute();
  const router = useRouter();
  const { t, locale } = useI18n();

  // Presentation metadata for the normal CRUD routes that use the shared form surface.
  const standardFormIcons: Record<string, string> = {
    admin: 'pi pi-user',
    'attachment-types': 'pi pi-file-edit',
    brand: 'pi pi-tag',
    client: 'pi pi-users',
    'client-source': 'pi pi-share-alt',
    departments: 'pi pi-sitemap',
    employee: 'pi pi-id-card',
    item: 'pi pi-box',
    item_types: 'pi pi-box',
    labor: 'pi pi-users',
    location: 'pi pi-map-marker',
    'location-city': 'pi pi-map-marker',
    'location-governorate': 'pi pi-map-marker',
    material: 'pi pi-box',
    measurement: 'pi pi-sliders-h',
    organization: 'pi pi-building',
    package: 'pi pi-box',
    projectType: 'pi pi-sitemap',
    'quote-types': 'pi pi-file-edit',
    space: 'pi pi-clone',
    specialization: 'pi pi-sitemap',
    stages: 'pi pi-clone',
    'sub-stages': 'pi pi-clone',
    suppliers: 'pi pi-truck',
    supply: 'pi pi-box',
    term: 'pi pi-file-edit',
    terms: 'pi pi-file-edit',
    'invoice-payment': 'pi pi-wallet',
  };

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
    const icon = section ? standardFormIcons[section] : undefined;
    if (!icon) return undefined;

    const descriptionKey =
      action === 'edit' ? 'standard_form.edit_description' : 'standard_form.add_description';

    return { icon, description: t(descriptionKey) };
  });

  const specializedPageIntro = computed(() => {
    switch (route.name) {
      case 'add-project':
        return {
          icon: 'pi pi-building',
          title: t('Project.add'),
          description: t('Project.form_description'),
        };
      case 'edit-project':
        return {
          icon: 'pi pi-pen-to-square',
          title: t('Project.edit'),
          description: t('standard_form.edit_description'),
        };
      case 'show-project':
        return {
          icon: 'pi pi-building',
          title: t('ProjectShow.project_details'),
          description: t('ProjectShow.project_information_summary'),
        };
      case 'Add Execution Quote':
        return {
          icon: 'pi pi-file-edit',
          title: t('execution_quote.title'),
          description: t('execution_quote.subtitle'),
        };
      default:
        return undefined;
    }
  });

  const pageIntroDetail = computed(() => specializedPageIntro.value ?? standardFormDetail.value);

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
    class="feature-header-container"
    :class="{ 'feature-header-container--page-intro': pageIntroDetail }"
  >
    <img class="header-img" :src="FeatureHeader" :alt="$t('feature_header_image_alt')" />
    <div class="content" :class="{ 'content--standard-form': pageIntroDetail }">
      <span v-if="pageIntroDetail" class="standard-form-header-icon" aria-hidden="true">
        <i :class="pageIntroDetail.icon"></i>
      </span>
      <div v-if="pageIntroDetail" class="standard-form-header-copy">
        <h1 class="title">
          {{ specializedPageIntro?.title ?? getLabel(items[items.length - 1]) }}
        </h1>
        <p v-if="pageIntroDetail.description" class="standard-form-header-description">
          {{ pageIntroDetail.description }}
        </p>
      </div>
      <h1 v-else class="title">{{ getLabel(items[items.length - 1]) }}</h1>
    </div>
    <div class="actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>
