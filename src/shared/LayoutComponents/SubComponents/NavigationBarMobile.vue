<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

interface MenuItem {
  text: string;
  icon: string;
  route: string;
}

const menuItems = ref<MenuItem[]>([
  { text: "Home", icon: "home-outline", route: "/" },
  { text: "Offers", icon: "ticket-outline", route: "/projects/All" },
  { text: "Add", icon: "add-circle-outline", route: "/add-project" },
  { text: "Clients", icon: "person-circle-outline", route: "/users" },
]);

const isActive = (itemRoute: string) => {
  return route.path === itemRoute;
};
</script>

<template>
  <nav class="mobile-nav">
    <router-link
      v-for="(item, index) in menuItems"
      :key="index"
      :to="item.route"
      class="nav-item"
      :class="{ active: isActive(item.route) }"
    >
      <span class="nav-icon">
        <ion-icon :name="item.icon"></ion-icon>
      </span>
      <span class="nav-label">{{ item.text }}</span>
    </router-link>
    <div class="nav-indicator"></div>
  </nav>
</template>

<style scoped lang="scss">
@use "../../../styles/variables" as *;

.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: var(--bg-main);
  border-top: 1px solid var(--border-weak);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 10000;
  padding-bottom: env(safe-area-inset-bottom, 0);

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 8px 16px;
    border-radius: var(--radius-md);
    text-decoration: none;
    color: var(--gray-400);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    min-width: 64px;

    &:active {
      transform: scale(0.92);
    }

    &.active {
      color: var(--PrimaryColor);

      .nav-icon {
        background-color: var(--PrimaryColor-light);
        transform: translateY(-2px);
      }

      .nav-label {
        color: var(--PrimaryColor);
        font-weight: 600;
      }
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

      ion-icon {
        font-size: 22px;
      }
    }

    .nav-label {
      font-size: 11px;
      font-weight: 500;
      transition: color 0.25s ease;
      white-space: nowrap;
    }
  }

  .nav-indicator {
    display: none;
  }
}
</style>
