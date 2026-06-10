<script setup lang="ts">
  import { onMounted, computed } from 'vue';
  import SupportContactsController from '../controllers/support.controller';
  import SupportEmptyDataIcon from '@/shared/icons/Support/SupportEmptyDataIcon.vue';
  import EditpinIcon from '@/shared/icons/EditpinIcon.vue';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import PhoneIcon from '@/shared/icons/Support/PhoneIcon.vue';
  import WhatsIcon from '@/shared/icons/Support/WhatsIcon.vue';
  import EmailIcon from '@/shared/icons/Support/EmailIcon.vue';
  import IndexSupportContactsParams from '../../core/params/index.about.params';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import SupportSeklaton from '../SupportSeklaton.vue';

  const controller = SupportContactsController.getInstance();

  const contacts = computed(() => {
    const state = controller.listState.value;
    if (state instanceof DataSuccess) return (state.data as any[]) ?? [];
    return [];
  });

  const hasData = computed(() => contacts.value.length > 0);

  onMounted(async () => {
    const indexSupportParams = new IndexSupportContactsParams('', 1, 10, false);
    await controller.fetchList(indexSupportParams);
  });
</script>

<template>
  <DataStatusBuilder :controller="controller.listState.value">
    <template #success>
      <div class="support-contact-page">
        <div class="header-container">
          <div class="about-header">
            <h2 class="title">{{ $t('support_contact_details') }}</h2>
            <p class="description">{{ $t('support_contact_details_description') }}</p>
          </div>
          <div class="header-actions">
            <router-link to="/support/add" class="btn-outline-green">
              + {{ $t('add_new_support_section') }}
            </router-link>
            <router-link to="/support/edit" class="btn-filled-green">
              <EditpinIcon />
              <span>{{ $t('edit') }}</span>
            </router-link>
          </div>
        </div>

        <div v-if="hasData" class="sections-list">
          <div v-for="(section, idx) in contacts" :key="idx" class="support-view-card">
            <div class="section-title-bar">
              <span>{{ section.titles }}</span>
            </div>
            <div
              v-if="
                section?.supportContacts?.length > 0 ||
                section.supportContacts?.length > 0 ||
                section.supportContacts?.length > 0 ||
                section.supportContacts?.length > 0
              "
              class="contact-info-row"
            >
              <div v-if="section.supportContacts?.length" class="contact-item">
                <PhoneIcon />
                <div class="contact-info">
                  <span class="contact-label">{{ $t('Phone Number') }}</span>
                  <span class="contact-value">{{
                    section?.supportContacts?.find((el: any) => el?.key == 'phonenumbers')?.value
                  }}</span>
                </div>
              </div>

              <div v-if="section.supportContacts?.length" class="contact-item">
                <WhatsIcon />
                <div class="contact-info">
                  <span class="contact-label">{{ $t('chat_on_whatsapp') }}</span>
                  <span class="contact-value">{{
                    section?.supportContacts?.find((el: any) => el?.key == 'whatsapp_numbers')
                      ?.value
                  }}</span>
                </div>
              </div>

              <div v-if="section.supportContacts?.length" class="contact-item">
                <EmailIcon />
                <div class="contact-info">
                  <span class="contact-label">{{ $t('email_address') }}</span>
                  <span class="contact-value">{{
                    section?.supportContacts?.find((el: any) => el?.key == 'emails')?.value
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #empty>
      <div class="about-page">
        <div class="empty-data">
          <SupportEmptyDataIcon />
          <h5>{{ $t('no_contact_details') }}</h5>
          <p>{{ $t('no_contact_details_description') }}</p>
          <router-link to="/support/add" class="btn btn-primary">
            {{ $t('add_support') }}
          </router-link>
        </div>
      </div>
    </template>
    <template #loader>
      <SupportSeklaton />
    </template>
    <template #default>
      <div class="about-page">
        <div class="empty-data">
          <SupportEmptyDataIcon />
          <h5>{{ $t('no_contact_details') }}</h5>
          <p>{{ $t('no_contact_details_description') }}</p>
          <router-link to="/support/add" class="btn btn-primary">
            {{ $t('add_support') }}
          </router-link>
        </div>
      </div>
    </template>
  </DataStatusBuilder>
</template>
