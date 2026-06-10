<script setup lang="ts">
  import { onMounted, computed, ref } from 'vue';
  import AboutController from '../controllers/about.controller';
  import EditpinIcon from '@/shared/icons/EditpinIcon.vue';
  import LinksIcon from '@/shared/icons/SocialIcons/LinksIcon.vue';
  import EmptyData from '@/shared/icons/About/EmptyData.vue';
  import IndexAboutParams from '../../core/params/index.about.params';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AbourSkelaton from '../AbourSkelaton.vue';

  // Controller instance
  const controller = AboutController.getInstance();
  const state = computed(() => controller.listState.value);
  // const route = useRoute();

  const about = computed(() =>
    state.value.data && state.value.data.length > 0 ? state.value.data[0] : null,
  );

  // Pagination state
  const perPage = ref(10);
  const word = ref('');

  const fetchAbout = async (page: number = 1, wordStr: string = '') => {
    await controller.fetchList(
      new IndexAboutParams(wordStr || word.value, page, perPage.value, 1, true),
    );
  };

  onMounted(async () => {
    await fetchAbout();
  });

</script>

<template>
  <DataStatusBuilder :controller="state" >
    <template #success>
      <div class="about-page">
        <div class="header-container">
          <div class="about-header">
            <h2 class="title">{{ $t('about us') }}</h2>
            <p class="description">
              {{ $t('Manage and review platform information visible to students') }}
            </p>
          </div>
          <router-link to="/about/edit" class="btn btn-primary">
            <EditpinIcon />
            <span>{{ $t('edit') }}</span>
          </router-link>
        </div>

        <div v-if="about" class="about-content">
          <div class="text-content">
            <h5>
              {{
                about.translations?.title?.[
                  $i18n.locale as keyof typeof about.translations.title
                ] || about.translations?.title?.['en']
              }}
            </h5>
            <p>
              {{
                about.translations?.description?.[
                  $i18n.locale as keyof typeof about.translations.description
                ] || about.translations?.description?.['en']
              }}
            </p>
          </div>
          <div class="image-content">
            <img v-if="about.images" :src="about.images" alt="about-img" />
          </div>
          <div class="social-content">
            <div class="socail-header">
              <LinksIcon />
              <h5>social media links</h5>
            </div>
            <div class="social-icons">
              <router-link
                v-for="(item, index) in about.socialMedia"
                :key="index"
                :to="item.link || ''"
              >
                <img v-if="item.icon" :src="item.icon" alt="icon" />
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #empty>
      <div class="about-page">
        <div class="empty-data">
          <EmptyData />
          <h5>No about information added</h5>
          <p>Add details about your platform to display them to students</p>
          <router-link to="/about/add" class="btn btn-primary"
            >Add about</router-link
          >
        </div>
      </div>
    </template>
    <template #loader>
      <AbourSkelaton />
    </template>
    <template #default>
      <div class="about-page">
        <div class="empty-data">
          <EmptyData />
          <h5>No about information added</h5>
          <p>Add details about your platform to display them to students</p>
          <router-link to="/about/add" class="btn btn-primary"
            >Add about</router-link
          >
        </div>
      </div>
    </template>
  </DataStatusBuilder>
</template>
