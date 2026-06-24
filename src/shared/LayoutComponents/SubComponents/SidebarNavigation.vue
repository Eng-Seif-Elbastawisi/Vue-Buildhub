<script setup lang="ts">
  import { computed, type Component } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { storeToRefs } from 'pinia';

  import TechlabLogo from '@/assets/images/TechlabLogo.png';

  import EducationClassificationIcon from '@/shared/icons/SidebarIcons/EducationClassificationIcon.vue';
  import AuthArrowIcon from '@/shared/icons/SidebarIcons/AuthArrowIcon.vue';
  import IconLogout from '@/shared/icons/IconLogout.vue';
  import ArticleIcon from '@/shared/icons/ArticleIcon.vue';

  import Accordion from 'primevue/accordion';
  import AccordionPanel from 'primevue/accordionpanel';
  import AccordionHeader from 'primevue/accordionheader';
  import AccordionContent from 'primevue/accordioncontent';

  import { useUserStore } from '@/stores/user';

  const route = useRoute();
  const router = useRouter();

  const emit = defineEmits<{
    (e: 'clickItem'): void;
  }>();

  const userStore = useUserStore();
  const { user } = storeToRefs(userStore);

  type UserRole = 'admin' | 'organization';

  interface MenuItemConfig {
    path: string;
    name: string;
    icon?: Component;
    badge?: string;
    hasArrow?: boolean;

    /**
     * لو roles مش موجودة، الصفحة هتظهر للأدمن والأورجانيزيشن.
     * roles: ['admin'] معناها أدمن فقط.
     * roles: ['organization'] معناها أورجانيزيشن فقط.
     */
    roles?: UserRole[];
  }

  interface MenuSectionConfig {
    group: string;
    items: MenuItemConfig[];
  }

  interface MenuItem extends MenuItemConfig {
    link: string;
  }

  interface MenuSection {
    group: string;
    items: MenuItem[];
  }

  const currentRole = computed<UserRole>(() => {
    return user.value?.isMaster || Number(user.value?.type) === 1 ? 'admin' : 'organization';
  });

  const appPrefix = computed(() => {
    return currentRole.value === 'admin' ? '/admin' : '/organization';
  });

  const menuConfig: MenuSectionConfig[] = [
    {
      group: 'Overview',
      items: [
        {
          path: '/stages',
          name: 'Stages',
          icon: EducationClassificationIcon,
        },
        {
          path: '/departments',
          name: 'Departments',
          icon: EducationClassificationIcon,
        },

        {
          path: '/measurement',
          name: 'Measurement',
          icon: EducationClassificationIcon,
        },

        {
          path: '/item',
          name: 'Items',
          icon: EducationClassificationIcon,
        },
        {
          path: '/admin',
          name: 'Admins',
          icon: EducationClassificationIcon,
          roles: ['admin'],
        },
        {
          path: '/organization',
          name: 'Organizations',
          icon: EducationClassificationIcon,
          roles: ['organization'],
        },

        {
          path: '/client-source',
          name: 'Client Source',
          icon: EducationClassificationIcon,
        },
      ],
    },
    {
      group: 'Suppliers',
      items: [
        {
          path: '/suppliers',
          name: 'Suppliers',
          icon: ArticleIcon,
          roles: ['organization'],
        },
        {
          path: '/brand',
          name: 'Brand',
          icon: ArticleIcon,
        },
        {
          path: '/supply',
          name: 'Supply',
          icon: ArticleIcon,
        },
        {
          path: '/projectType',
          name: 'Project Types',
          icon: ArticleIcon,
        },
        {
          path: '/client',
          name: 'Clients',
          icon: ArticleIcon,
          roles: ['organization'],
        },
        {
          path: '/location',
          name: 'Location',
          icon: ArticleIcon,
        },
        {
          path: '/employee',
          name: 'Employee',
          icon: ArticleIcon,
          roles: ['organization'],
        },
        {
          path: '/material',
          name: 'Material',
          icon: ArticleIcon,
          // roles: ['organization'],
        },
      ],
    },
  ];

  const menu = computed<MenuSection[]>(() => {
    return menuConfig
      .map((section) => {
        const items = section.items
          .filter((item) => {
            if (!item.roles) return true;

            return item.roles.includes(currentRole.value);
          })
          .map((item) => ({
            ...item,
            link: `${appPrefix.value}${item.path}`,
          }));

        return {
          group: section.group,
          items,
        };
      })
      .filter((section) => section.items.length > 0);
  });

  const isActiveRoute = (link: string) => {
    return route.path === link || route.path.startsWith(`${link}/`);
  };

  const logout = () => {
    const loginPath = currentRole.value === 'admin' ? '/login-admin' : '/login-organization';

    userStore.logout();

    router.push(loginPath);
  };
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-wrapper">
      <div class="logo-container">
        <img class="logo" :src="TechlabLogo" alt="Techlab Logo" />
      </div>

      <div class="menu">
        <div v-for="(group, gIndex) in menu" :key="gIndex" class="menu-group">
          <p v-if="group.group" class="group-title">
            {{ group.group }}
          </p>

          <router-link
            v-for="(item, i) in group.items"
            :key="i"
            :to="item.link"
            class="menu-item"
            :class="{ active: isActiveRoute(item.link) }"
            @click="emit('clickItem')"
          >
            <component :is="item.icon" v-if="item.icon" class="icon" />

            <span class="label">
              {{ item.name }}
            </span>

            <span v-if="item.badge" class="badge">
              {{ item.badge }}
            </span>

            <span v-if="item.hasArrow" class="arrow">›</span>
          </router-link>
        </div>
      </div>

      <Accordion value="0">
        <template #collapseicon></template>
        <template #expandicon></template>

        <AccordionPanel value="0">
          <AccordionHeader>
            <div class="auth-container">
              <div class="auth-data">
                <img
                  :src="user?.image || 'https://cyber.comolho.com/static/img/avatar.png'"
                  alt="User image"
                />

                <div class="user-data">
                  <span class="name">
                    {{ user?.name || 'User' }}
                  </span>

                  <span class="status">
                    {{ currentRole === 'admin' ? 'Admin' : 'Organization' }}
                  </span>
                </div>
              </div>

              <AuthArrowIcon />
            </div>
          </AccordionHeader>

          <AccordionContent>
            <div class="mega-body">
              <div class="divider"></div>

              <button type="button" class="menu-item danger" @click="logout">
                <IconLogout />
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
    border: 0 !important;
    background: transparent !important;
  }

  :deep(.p-accordionheader-link) {
    padding: 0 !important;
    box-shadow: none !important;
    margin: 0 !important;
    border: 0 !important;
    background: transparent !important;
  }

  :deep(.p-accordion) {
    margin-top: auto;
    border: 0 !important;
    background: transparent !important;
  }

  :deep(.p-accordionpanel) {
    border: 0 !important;
    background: transparent !important;
  }

  :deep(.p-accordioncontent) {
    border: 0 !important;
    background: transparent !important;
  }

  :deep(.p-accordioncontent-content) {
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
  }
</style>
