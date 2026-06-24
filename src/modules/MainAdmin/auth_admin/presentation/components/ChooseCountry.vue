<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import CountryController from '@/modules/country/presentation/controllers/country.controller';
  import CountryCard from './CountryCard.vue';
  import type CountryModel from '@/modules/country/core/models/country.model';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import IndexCountryParams from '@/modules/country/core/params/index.country.params';
  import { useRoute, useRouter } from 'vue-router';
  import { useCountryStore } from '@/stores/country';
  // import { debounce } from '@/base/Presentation/Utils/debouced';
  // import { debounce } from '@/base/Presentation/Utils/debouced';

  const controller = CountryController.getInstance();
  const state = computed(() => controller.listState.value);
  const perPage = ref<number>(10);
  const selectedCountryId = ref<number>(0);
  const selectedCountryCode = ref<string>('');
  const word = ref<string>('');
  const route = useRoute();
  const router = useRouter();

  const CountryStore = useCountryStore();
  const selectCountry = (country: CountryModel) => {
    // console.log(country.id, 'Country');
    selectedCountryId.value = country.id;
    selectedCountryCode.value = country.code;
    CountryStore.setCountryCode(country.code);
  };

  const fetchCountries = async (page: number = 1, word: string = '') => {
    await controller.fetchList(
      new IndexCountryParams(
        word,
        route.query.page ? Number(route.query.page) : page,
        perPage.value,
      ),
    );
  };

  onMounted(async () => {
    if (route.query.word) {
      word.value = String(route.query.word);
    }

    await fetchCountries(route.query.page ? Number(route.query.page) : 1, word.value);
  });
  const continueToLogin = () => {
    if (!selectedCountryId.value) return;
    router.push({ name: 'Login' });
  };
</script>

<template>
  <section class="auth-layout">
    <div class="auth-header">
      <h3 class="title">{{ $t('Choose your country') }}</h3>
      <p class="sub-title">
        {{ $t('Choose your country to access localized content and settings') }}
      </p>
    </div>
    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchCountries()">
      <template #success="{ data }">
        <div class="country-grid">
          <CountryCard
            v-for="country in data"
            :key="country.id"
            :country="country"
            :selected-country-id="selectedCountryId"
            @select-country="selectCountry"
          />
          <!-- </div> -->
        </div>
      </template>
    </DataStatusBuilder>
    <button
      :class="['btn btn-primary', { disabled: !selectedCountryId }]"
      type="button"
      @click="continueToLogin"
    >
      <!-- :disabled="!selectedCountryId" -->
      {{ $t('continue_to_login') }}
    </button>
  </section>
</template>
