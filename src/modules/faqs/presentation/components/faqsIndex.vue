<script setup lang="ts">
  import { onMounted, computed, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import FaqsController from '../controllers/faqs.controller';
  import EmptyFaqs from '@/shared/icons/faqs/EmptyFaqs.vue';
  import EditpinIcon from '@/shared/icons/EditpinIcon.vue';
  import DeleteFaqsParams from '../../core/params/delete.faqs.params';
  import type FaqsModel from '../../core/models/faqs.model';
  import IconAdd from '@/shared/icons/IconAdd.vue';
  import IconMins from '@/shared/icons/IconMins.vue';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import FaqsSkellaton from '../subComponent/FaqsSkellaton.vue';

  const controller = FaqsController.getInstance();
  const route = useRoute();
  const router = useRouter();

  const countryCode = computed(() => (route.params?.country_code as string) || '');

  const faqs = computed<FaqsModel[]>(() => {
    const data = controller.listState.value?.data;
    if (Array.isArray(data)) return (data as FaqsModel[]) ?? [];
    return [];
  });

  const hasData = computed(() => faqs.value.length > 0);

  const expandedIndex = ref<number | null>(0);

  const toggleExpand = (index: number) => {
    expandedIndex.value = expandedIndex.value === index ? null : index;
  };

  const getQuestion = (faq: FaqsModel) => {
    return faq.question;
  };

  const getAnswer = (faq: FaqsModel) => {
    return faq.answer;
  };

  const editFaq = (id: number) => {
    router.push(`faqs/${id}/edit`);
  };

  const deleteFaq = async (id: number) => {
    await controller.delete(new DeleteFaqsParams({ id }), undefined);
    await controller.fetchList();
  };

  onMounted(async () => {
    await controller.fetchList();
  });
</script>

<template>
  <div class="faqs-page">
    <div class="header-container">
      <div class="about-header">
        <h2 class="title">{{ $t('faqs') }}</h2>
        <p class="description">{{ $t('faqs_description') }}</p>
      </div>
      <div class="header-actions">
        <!-- v-if="hasData"  -->
        <router-link :to="`faqs/add`" class="btn-filled-green">
          + {{ $t('add_faq') }}
        </router-link>
      </div>
    </div>
    <DataStatusBuilder :controller="controller.listState.value">
      <template #success>
        <div v-if="hasData" class="sections-list">
          <div v-for="(faq, idx) in faqs" :key="faq.id ?? idx" class="faq-card">
            <!-- Question row -->
            <div class="faq-row-header" @click="toggleExpand(idx)">
              <div class="faq-row-left">
                <button type="button" class="expand-btn" :aria-expanded="expandedIndex === idx">
                  <IconAdd v-if="expandedIndex !== idx" />
                  <IconMins v-else />
                </button>
                <span class="faq-question">{{ getQuestion(faq) }}</span>
              </div>

              <div class="faq-row-actions" @click.stop>
                <button type="button" class="action-btn edit-btn" @click="editFaq(faq.id!)">
                  <EditpinIcon />
                </button>
                <button type="button" class="action-btn delete-btn" @click="deleteFaq(faq.id!)">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 6H5H21"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M8 6V4C8 3.45 8.45 3 9 3H15C15.55 3 16 3.45 16 4V6M19 6L18.12 19.13C18.05 20.15 17.23 20.94 16.21 20.94H7.79C6.77 20.94 5.95 20.15 5.88 19.13L5 6H19Z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Answer panel -->
            <transition name="faq-answer">
              <div v-if="expandedIndex === idx" class="faq-answer">
                <p>{{ getAnswer(faq) }}</p>
              </div>
            </transition>
          </div>
        </div>
      </template>
      <template #empty>
        <div class="faqs-page">
          <div class="empty-data">
            <EmptyFaqs />
            <h5>{{ $t('no_faqs_yet') }}</h5>
            <p>{{ $t('no_faqs_description') }}</p>
            <router-link :to="`/${countryCode}/faqs/add`" class="btn-filled-green">
              {{ $t('add_faq') }}
            </router-link>
          </div>
        </div>
      </template>
      <template #loader>
        <FaqsSkellaton />
      </template>
      <template #default>
        <div class="faqs-page">
          <div class="empty-data">
            <EmptyFaqs />
            <h5>{{ $t('no_faqs_yet') }}</h5>
            <p>{{ $t('no_faqs_description') }}</p>
            <router-link :to="`/${countryCode}/faqs/add`" class="btn-filled-green">
              {{ $t('add_faq') }}
            </router-link>
          </div>
        </div>
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style scoped lang="scss"></style>
