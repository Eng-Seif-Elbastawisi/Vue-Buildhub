<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { computed, ref, type Component } from 'vue';
import SettingIcon from '@/shared/icons/SidebarIcons/SettingIcon.vue';
import DocumentIcon from '@/shared/icons/BreadcrumbIcons/DocumentIcon.vue';
import TechlabLogo from '@/assets/images/TechlabLogo.png';
import EducationClassificationIcon from '@/shared/icons/SidebarIcons/EducationClassificationIcon.vue';
import SidebarPrivecy from '@/shared/icons/SidebarPrivecy.vue';
import SidebarTerms from '@/shared/icons/SidebarTerms.vue';
import Sidebaremploye from '@/shared/icons/Sidebaremploye.vue';
import SupportIcon from '@/shared/icons/SidebarIcons/SupportIcon.vue';
import AboutIcon from '@/shared/icons/SidebarIcons/AboutIcon.vue';
import FaqsIcon from '@/shared/icons/SidebarIcons/FaqsIcon.vue';
import { useUserStore } from '@/stores/user';
import AuthArrowIcon from '@/shared/icons/SidebarIcons/AuthArrowIcon.vue';
import IconLogout from '@/shared/icons/IconLogout.vue';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import Question from '@/shared/icons/question.vue';
import ArticleIcon from '@/shared/icons/ArticleIcon.vue';

const route = useRoute();
const emit = defineEmits(['clickItem']);
interface MenuItem {
  link: string;
  name: string;
  icon?: Component;
  badge?: string;
  hasArrow?: boolean;
}
interface MenuSection {
  group: string;
  items: MenuItem[];
}

const baseMenu: MenuSection[] = [
  {
    group: 'Overview',
    items: [
      {
        link: '/education-classifications',
        name: 'Education configuration',
        icon: EducationClassificationIcon,
      },
      {
        link: '/employees',
        name: 'Employees',
        icon: Sidebaremploye,
      },
      {
        link: '/documents',
        name: 'Documents',
        icon: DocumentIcon,
      },
      {
        link: '/skills',
        name: 'Skills',
        icon: SettingIcon,
      },

      // {
      //   link: '/stages',
      //   name: 'Stages',
      //   icon: SettingIcon,
      // },
      // {
      //   link: '/subjects',
      //   name: 'Subjects',
      //   icon: SettingIcon,
      // },
      // {
      //   link: '/units',
      //   name: 'Units',
      //   icon: SettingIcon,
      // },
    ],
  },
  // {
  //   group: 'location',
  //   items: [
  //     {
  //       link: '/countries',
  //       name: 'Countries',
  //       icon: SettingIcon,
  //     },
  //   ],
  // },
  {
    group: 'Apps Kits',
    items: [
      {
        link: '/questions',
        name: 'Questions',
        icon: Question,
      },
      {
        link: '/articles',
        name: 'Articles',
        icon: ArticleIcon,
      },
    ],
  },
  {
    group: 'statics',
    items: [
      {
        link: '/about',
        name: 'About',
        icon: AboutIcon,
      },
      {
        link: '/support',
        name: 'Support',
        icon: SupportIcon,
      },
      {
        link: '/faqs',
        name: 'Faqs',
        icon: FaqsIcon,
      },
      {
        link: '/privacy',
        name: 'Privacy and policy',
        icon: SidebarPrivecy,
      },
      {
        link: '/terms-conditions',
        name: 'terms & conditions',
        icon: SidebarTerms,
      },
      {
        link: '/deleted-accounts',
        name: 'add logout reasons',
        icon: SidebarTerms,
      },

    ],
  },
];

const menu = computed<MenuSection[]>(() => baseMenu);

const { user } = useUserStore();
//logout
const userStore = useUserStore();
const router = useRouter();

const logout = () => {
  userStore.logout();
  router.push({ name: 'Choose Country' });
};

const isDropMenuOpen = ref(false);

const toggleDropMenu = () => {
  isDropMenuOpen.value = !isDropMenuOpen.value;
};
</script>
<template>
  <aside class="sidebar">
    <div class="sidebar-wrapper">
      <div class="logo-container">
        <img class="logo" :src="TechlabLogo" alt="Techlab Logo" />
        <!-- <h2 class="logo">Logo</h2> -->
      </div>

      <!-- Menu -->
      <div class="menu">
        <div v-for="(group, gIndex) in menu" :key="gIndex" class="menu-group">
          <p v-if="group.group" class="group-title">
            {{ group.group }}
          </p>

          <router-link v-for="(item, i) in group.items" :key="i" :to="item.link" class="menu-item"
            :class="{ active: route.path === item.link }" @click="emit('clickItem')">
            <component :is="item.icon" class="icon" />

            <span class="label">{{ item.name }}</span>

            <span v-if="item?.badge" class="badge">
              {{ item?.badge }}
            </span>

            <span v-if="item?.hasArrow" class="arrow">›</span>
          </router-link>
        </div>
      </div>

      <Accordion :value="0">
        <template #collapseicon> </template>
        <template #expandicon> </template>
        <AccordionPanel value="0">
          <AccordionHeader>
            <div class="auth-container" @click="toggleDropMenu">
              <div class="auth-data">
                <img :src="user?.image || `https://cyber.comolho.com/static/img/avatar.png`" alt="image" />
                <div class="user-data">
                  <span class="name">{{ user?.name }}</span>
                  <span class="status">Admin</span>
                </div>
              </div>
              <auth-arrow-icon />
            </div>
          </AccordionHeader>
          <AccordionContent>
            <div class="mega-body">
              <button class="menu-item">
                <icon-user-circle />
                <span>{{ $t('my_profile') }}</span>
                <icon-chevron-right class="arrow" />
              </button>
              <button class="menu-item">
                <icon-settings />
                <span>{{ $t('settings') }}</span>
                <icon-chevron-right class="arrow" />
              </button>
              <button class="menu-item">
                <icon-bell />
                <span>{{ $t('notifications') }}</span>
                <icon-chevron-right class="arrow" />
              </button>
              <div class="divider"></div>
              <button class="menu-item danger" @click="logout">
                <icon-logout />
                <span>{{ $t('logout') }}</span>
              </button>
            </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </div>
  </aside>
</template>

<style scoped>
:deep(.p-accordionheader) {
  padding: 0 !important;
  box-shadow: none !important;
  margin: 0 !important;
}

:deep(.p-accordionheader-link) {
  padding: 0 !important;
  box-shadow: none !important;
  margin: 0 !important;
}

:deep(.p-accordion) {
  margin-top: auto;
}

:deep(.p-accordioncontent-content) {
  padding: 0 !important;
}
</style>
