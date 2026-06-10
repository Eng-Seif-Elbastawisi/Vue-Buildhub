import "./styles/main.min.css";
import { createApp } from "vue";
import PrimeVue from "primevue/config";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import Aura from "@primeuix/themes/aura";
import { createI18n } from "vue-i18n";
import ar from "./locales/ar.json";
import en from "./locales/en.json";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import ToastService from "primevue/toastservice";

const i18n = createI18n({
  locale: "en",
  fallbackLocale: "en",
  messages: {
    en,
    ar,
  },
});
const pinia = createPinia();

const app = createApp(App)
  .use(PrimeVue, {
    theme: {
      preset: Aura,
    },
  })
  .use(pinia)
  .use(pinia.use(piniaPluginPersistedstate))
  .use(router)
  .use(i18n)
  .use(ToastService);

// Initialize persisted state from user store (auto-logout timer)
import { useUserStore } from "@/stores/user";
const userStore = useUserStore();
userStore.initFromPersist();

app.mount("#app");
