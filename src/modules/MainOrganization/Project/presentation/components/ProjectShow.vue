<script setup lang="ts">
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import ProjectDepartmentsSection from './project_show/ProjectDepartmentsSection.vue';
  import ProjectFloorsSection from './project_show/ProjectFloorsSection.vue';
  import ProjectInfoSection from './project_show/ProjectInfoSection.vue';
  import ProjectItemsSection from './project_show/ProjectItemsSection.vue';
  import ProjectPricingSection from './project_show/ProjectPricingSection.vue';
  import ProjectShowHeader from './project_show/ProjectShowHeader.vue';
  import ProjectStatsSection from './project_show/ProjectStatsSection.vue';
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
    handleChangeProjectStatus,
    goToSection,
    headerProps,
    tabsProps,
    statsProps,
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
  <div class="project-details-page project-show-page">
    <DataStatusBuilder
      :controller="projectController.itemState.value"
      :on-retry="
        async () => {
          await fetchProject();
        }
      "
    >
      <template #loader>
        <section class="project-state-card" aria-live="polite" aria-busy="true">
          <span class="project-state-card__icon" aria-hidden="true">
            <i class="pi pi-spin pi-spinner"></i>
          </span>
          <strong>{{ t('loading') }}</strong>

          <div class="project-state-card__skeleton" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </section>
      </template>

      <template #failed="{ error, retry }">
        <section class="project-state-card project-state-card--error">
          <span class="project-state-card__icon" aria-hidden="true">
            <i class="pi pi-exclamation-triangle"></i>
          </span>
          <strong>
            {{
              error?.displayMessage ||
              error?.title ||
              projectController.errorMessage.value ||
              t('no_data')
            }}
          </strong>
          <button class="project-action-btn" type="button" @click="retry">
            <i class="pi pi-refresh" aria-hidden="true"></i>
            {{ t('try_again') }}
          </button>
        </section>
      </template>

      <template #empty>
        <section class="project-state-card">
          <span class="project-state-card__icon" aria-hidden="true">
            <i class="pi pi-folder-open"></i>
          </span>
          <strong>{{ t('project_show.empty') }}</strong>
        </section>
      </template>

      <template #success>
        <div class="project-pdf-content">
          <section class="project-command-hero">
            <ProjectShowHeader
              v-bind="headerProps"
              @download-pdf="downloadProjectPdf"
              @convert-status-action="handleConvertStatusAction"
              @change-project-status="handleChangeProjectStatus"
            />

            <ProjectShowTabs v-bind="tabsProps" @select="goToSection" />
          </section>

          <section class="project-content-surface">
            <ProjectStatsSection v-bind="statsProps" />

            <main class="project-dashboard-grid">
              <div class="project-dashboard-main">
                <ProjectInfoSection v-bind="projectInfoSectionProps" />

                <details class="project-floors-disclosure" open>
                  <summary class="card-title">
                    <i class="pi pi-building-columns"></i>
                    <h2>{{ floorsSectionProps.title }}</h2>
                    <i class="pi pi-chevron-down project-disclosure-chevron" aria-hidden="true"></i>
                  </summary>

                  <ProjectFloorsSection v-bind="floorsSectionProps" embedded />
                </details>

                <ProjectSpacesSection v-bind="spacesSectionProps" />

                <ProjectPricingSection v-bind="pricingSectionProps" />
              </div>

              <ProjectSideColumn class="project-dashboard-side" v-bind="sideColumnProps">
                <ProjectDepartmentsSection
                  v-if="projectDepartments.length"
                  v-bind="departmentsSectionProps"
                />

                <ProjectItemsSection v-else v-bind="itemsSectionProps" />
              </ProjectSideColumn>
            </main>
          </section>
        </div>
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style lang="scss">
  @use '../styles/project_show';
</style>
