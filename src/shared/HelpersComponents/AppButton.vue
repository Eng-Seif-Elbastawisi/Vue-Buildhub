<script lang="ts" setup>
import { computed } from "vue";

export type ButtonTheme = "primary" | "secondary" | "third" | "danger";
export type ButtonType = "button" | "submit" | "reset";
export type ButtonSize = "sm" | "md" | "lg";
export type IconPosition = "left" | "right";

const props = withDefaults(
  defineProps<{
    theme?: ButtonTheme;
    type?: ButtonType;
    size?: ButtonSize;
    title?: string;
    disabled?: boolean;
    loading?: boolean;
    iconOnly?: boolean;
    icon?: IconPosition;
    block?: boolean;
    outline?: boolean;
    ghost?: boolean;
    to?: string | object;
    href?: string;
    target?: string;
  }>(),
  {
    theme: "primary",
    type: "button",
    size: "md",
    disabled: false,
    loading: false,
    iconOnly: false,
    block: false,
    outline: false,
    ghost: false,
  },
);

defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

const isDisabled = computed(() => props.disabled || props.loading);
const hasIcon = computed(() => props.iconOnly || props.icon !== undefined);

// Determine root element
const tag = computed(() => {
  if (props.to) return "router-link";
  if (props.href) return "a";
  return "button";
});

// Build attributes depending on tag
const rootAttrs = computed(() => {
  const base: Record<string, unknown> = {};
  if (props.title) base.title = props.title;
  if (props.to) return { ...base, to: props.to };
  if (props.href) return { ...base, href: props.href, target: props.target };
  return { ...base, type: props.type, disabled: isDisabled.value };
});
</script>

<template>
  <component
    :is="tag"
    v-bind="rootAttrs"
    class="app-btn btn"
    :class="[
      `btn-${theme}`,
      `btn--${size}`,
      {
        'btn--block': block,
        'btn--icon-only': iconOnly,
        'btn--outline': outline,
        'btn--ghost': ghost,
        'btn--loading': loading,
        'btn--disabled': isDisabled,
        'btn--has-icon': hasIcon && !iconOnly,
      },
    ]"
    :aria-disabled="isDisabled || undefined"
    :aria-busy="loading || undefined"
    @click="!isDisabled && $emit('click', $event)"
  >
    <!-- Loading spinner -->
    <span v-if="loading" class="loader" />

    <!-- Icon left -->
    <span v-if="icon === 'left' && !loading" class="btn__icon btn__icon--left">
      <slot name="icon" />
    </span>

    <!-- Icon only -->
    <span v-if="iconOnly && !loading" class="btn__icon">
      <slot name="icon">
        <slot />
      </slot>
    </span>

    <!-- Text content -->
    <span v-if="!iconOnly" class="btn__text">
      <slot />
    </span>

    <!-- Icon right -->
    <span
      v-if="icon === 'right' && !loading"
      class="btn__icon btn__icon--right"
    >
      <slot name="icon" />
    </span>
  </component>
</template>
