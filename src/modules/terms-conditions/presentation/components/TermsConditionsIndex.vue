<script setup lang="ts">
  import { onMounted, computed } from 'vue';
  import EditIcon from '@/shared/icons/Privacy/EditIcon.vue';
  import TermsConditionsController from '../controllers/terms-conditions.controller';
  import EmptyTermsIcon from '@/shared/icons/EmptyTermsIcon.vue';
  import ShowTermsParams from '../../core/params/show.term.params';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import TermSkellaton from '../subComponent/TermSkellaton.vue';

  const termsConditionsController = TermsConditionsController.getInstance();
  const status = computed(() => termsConditionsController.itemState.value);

  const ShowTermsConditions = async () => {
    const showTermsConditionsParams = new ShowTermsParams({
      id: 3,
      allLocales: false,
    });
    await termsConditionsController.fetchOne(showTermsConditionsParams);
  };

  onMounted(() => {
    ShowTermsConditions();
  });
</script>

<template>
  <div class="terms-container">
    <div class="header-container">
      <div class="terms-header">
        <h3>{{ $t('Terms & Conditions') }}</h3>
        <p>{{ $t('Define the rules and guidelines for using the platform') }}</p>
      </div>
      <router-link :to="{ name: 'Add TermsConditions' }" class="btn btn-primary">
        <EditIcon />
        {{ $t('edit') }}
      </router-link>
    </div>
    <!-- </div> -->

    <DataStatusBuilder :controller="status">
      <template #success>
        <!-- <div class="terms-container"> -->
        <!-- <div class="header-container">
          <div class="terms-header">
            <h3>{{ $t('Terms & Conditions') }}</h3>
            <p>{{ $t('Define the rules and guidelines for using the platform') }}</p>
          </div>
          <router-link :to="{ name: 'Add TermsConditions' }" class="btn btn-primary">
            <EditIcon />
            {{ $t('edit') }}
          </router-link>
        </div> -->

        <div v-if="status.data" class="terms-content">
          <h2>{{ status.data?.title }}</h2>
          <p>{{ status.data?.description }}</p>
        </div>
        <!-- </div> -->
      </template>
      <template #empty>
        <div class="terms-container">
          <div class="empty-data">
            <EmptyTermsIcon />
            <h5>{{ $t('No terms added') }}</h5>
            <p>
              {{ $t('Add terms and conditions for using the platform') }}
            </p>
            <!-- <router-link :to="{ name: 'Add TermsConditions' }" class="btn btn-primary">
              {{ $t('Add terms & conditions') }}
            </router-link> -->
          </div>
        </div>
      </template>
      <template #failed>
        <div class="terms-container">
          <div class="empty-data">
            <EmptyTermsIcon />
            <h5>{{ $t('No terms added') }}</h5>
            <p>
              {{ $t('Add terms and conditions for using the platform') }}
            </p>
            <!-- <router-link :to="{ name: 'Add TermsConditions' }" class="btn btn-primary">
              {{ $t('Add terms & conditions') }}
            </router-link> -->
          </div>
        </div>
      </template>
      <template #loader>
        <TermSkellaton />
      </template>
      <template #default>
        <div class="terms-container">
          <div class="empty-data">
            <EmptyTermsIcon />
            <h5>{{ $t('No terms added') }}</h5>
            <p>
              {{ $t('Add terms and conditions for using the platform') }}
            </p>
            <router-link :to="{ name: 'Add TermsConditions' }" class="btn btn-primary">
              {{ $t('Add terms & conditions') }}
            </router-link>
          </div>
        </div>
      </template>
    </DataStatusBuilder>
  </div>
</template>
