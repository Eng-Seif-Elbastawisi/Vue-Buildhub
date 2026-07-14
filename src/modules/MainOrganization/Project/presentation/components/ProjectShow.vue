<script setup lang="ts">
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import ProjectDepartmentsSection from './project_show/ProjectDepartmentsSection.vue';
  import ProjectFloorsSection from './project_show/ProjectFloorsSection.vue';
  import ProjectInfoSection from './project_show/ProjectInfoSection.vue';
  import ProjectItemsSection from './project_show/ProjectItemsSection.vue';
  import ProjectPricingSection from './project_show/ProjectPricingSection.vue';
  import ProjectShowHeader from './project_show/ProjectShowHeader.vue';
  import ProjectShowTabs from './project_show/ProjectShowTabs.vue';
  import ProjectSideColumn from './project_show/ProjectSideColumn.vue';
  import ProjectSpacesSection from './project_show/ProjectSpacesSection.vue';
  import { useProjectShow } from '../composables/useProjectShow';

  const {
    t,
    projectController,
    projectDepartments,
    fetchProject,
    downloadProjectPdf,
    handleConvertStatusAction,
    goToSection,
    headerProps,
    tabsProps,
    projectInfoSectionProps,
    floorsSectionProps,
    spacesSectionProps,
    departmentsSectionProps,
    itemsSectionProps,
    pricingSectionProps,
    sideColumnProps,
  } = useProjectShow();
</script>

<template>
  <div class="project-details-page">
    <DataStatusBuilder
      :controller="projectController.itemState.value"
      :on-retry="
        async () => {
          await fetchProject();
        }
      "
    >
      <template #loader>
        <section class="project-state-card">
          {{ t('loading') }}
        </section>
      </template>

      <template #failed="{ error }">
        <section class="project-state-card project-state-card--error">
          {{
            error?.displayMessage ||
            error?.title ||
            projectController.errorMessage.value ||
            t('no_data')
          }}
        </section>
      </template>

      <template #empty>
        <section class="project-state-card">
          {{ t('no_data') }}
        </section>
      </template>

      <template #success>
        <div class="project-pdf-content">
          <ProjectShowHeader
            v-bind="headerProps"
            @download-pdf="downloadProjectPdf"
            @convert-status-action="handleConvertStatusAction"
          />

          <ProjectShowTabs v-bind="tabsProps" @select="goToSection" />

          <main class="project-dashboard">
            <section class="project-main-column">
              <ProjectInfoSection v-bind="projectInfoSectionProps" />

              <ProjectFloorsSection v-bind="floorsSectionProps" />

              <ProjectSpacesSection v-bind="spacesSectionProps" />

              <ProjectDepartmentsSection
                v-if="projectDepartments.length"
                v-bind="departmentsSectionProps"
              />

              <ProjectItemsSection v-else v-bind="itemsSectionProps" />

              <ProjectPricingSection v-bind="pricingSectionProps" />
            </section>

            <ProjectSideColumn v-bind="sideColumnProps" />
          </main>
        </div>
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style lang="scss">
  @use '../styles/project_show';
</style>
