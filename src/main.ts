import 'primeicons/primeicons.css';
import './styles/main.min.css';
import './styles/standard-crud-form.scss';
import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import Aura from '@primeuix/themes/aura';
import i18n from './locales/i18n';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import ToastService from 'primevue/toastservice';
import { useSystemIdentityTheme } from '@/modules/shared/SystemIdentity/presentation/composables/useSystemIdentityTheme';
import NetworkService from '@/base/Core/NetworkStructure/networking/networkService';
import { handleUnauthorizedResponse } from '@/base/Core/NetworkStructure/networking/utils/unauthorizedHandler';

const pinia = createPinia();

const app = createApp(App)
  .use(PrimeVue, {
    theme: {
      preset: Aura,
    },
    zIndex: {
      // Keep body-teleported dialogs above both dashboard sidebar layers.
      modal: 1600,
    },
  })
  .use(pinia)
  .use(pinia.use(piniaPluginPersistedstate))
  .use(router)
  .use(i18n)
  .use(ToastService);

// Initialize persisted state from user store (auto-logout timer)
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
userStore.initFromPersist();
NetworkService.instance.setUnauthorizedHandler(() => handleUnauthorizedResponse(router));

const { loadSavedPalette } = useSystemIdentityTheme();
loadSavedPalette();

app.mount('#app');
