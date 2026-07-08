<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
  import Popover from 'primevue/popover';
  import { useI18n } from 'vue-i18n';

  import dashedArrowImage from '@/assets/images/same-reference-dashed-arrow-transparent.png';
  import popoverPointerImage from '@/assets/images/field-help-popover-pointer.svg';
  import { resolveFieldHelpContent } from '@/shared/formHelp/fieldHelpRegistry';

  interface FieldHelpPopoverRef {
    toggle: (event: Event) => void;
    hide: () => void;
    container?: HTMLElement | null;
  }

  const FIELD_HELP_OPEN_EVENT = 'field-help-popover:open';

  const props = withDefaults(
    defineProps<{
      title?: string;
      description?: string;
      label?: string;
      fieldName?: string;
      fieldId?: string;
      helpTitle?: string;
      helpText?: string;
      importantTitle?: string;
      importantText?: string;
      tip?: string;
      icon?: string;
      helpExamples?: string[];
      showHelp?: boolean;
    }>(),
    {
      title: '',
      description: '',
      label: '',
      fieldName: '',
      fieldId: '',
      helpTitle: '',
      helpText: '',
      importantTitle: '',
      importantText: '',
      tip: '',
      icon: '',
      helpExamples: () => [],
      showHelp: true,
    },
  );

  const { t } = useI18n();
  const isOpen = ref(false);
  const popover = ref<FieldHelpPopoverRef | null>(null);
  const triggerButton = ref<HTMLButtonElement | null>(null);
  const connectorStyle = ref<Record<string, string>>({});
  const popoverId = `field-help-${Math.random().toString(36).slice(2, 10)}`;
  let connectorFrame = 0;
  let resizeObserver: ResizeObserver | null = null;

  const helpContent = computed(() =>
    resolveFieldHelpContent({
      showHelp: props.showHelp,
      helpTitle: props.helpTitle || props.title,
      helpText: props.helpText || props.description,
      importantTitle: props.importantTitle,
      importantText: props.importantText,
      tip: props.tip,
      icon: props.icon,
      helpExamples: props.helpExamples,
      fieldName: props.fieldName,
      fieldId: props.fieldId,
      label: props.label,
      translate: t,
    }),
  );

  const accessibleLabel = computed(
    () =>
      props.label ||
      props.helpTitle ||
      props.title ||
      props.fieldName ||
      props.fieldId ||
      t('field_help.default_field'),
  );

  const helpButtonLabel = computed(() =>
    t('field_help.show_for', {
      field: accessibleLabel.value,
    }),
  );

  const toggleHelp = (event: MouseEvent) => {
    if (!helpContent.value) return;

    if (isOpen.value) {
      closeHelp();
      return;
    }

    window.dispatchEvent(
      new CustomEvent(FIELD_HELP_OPEN_EVENT, {
        detail: {
          id: popoverId,
        },
      }),
    );
    popover.value?.toggle(event);
  };

  const closeHelp = () => {
    popover.value?.hide();
  };

  const handlePopoverShow = () => {
    isOpen.value = true;
    void nextTick(() => {
      startConnectorTracking();
      queueConnectorUpdate();
    });
  };

  const handlePopoverHide = () => {
    isOpen.value = false;
    stopConnectorTracking();
  };

  const handleActivePopoverRequest = (event: Event) => {
    const requestedId = (event as CustomEvent<{ id?: string }>).detail?.id;

    if (requestedId && requestedId !== popoverId && isOpen.value) {
      closeHelp();
    }
  };

  const getPopoverElement = () => popover.value?.container ?? null;

  const queueConnectorUpdate = () => {
    if (connectorFrame) {
      window.cancelAnimationFrame(connectorFrame);
    }

    connectorFrame = window.requestAnimationFrame(updateConnectorImage);
  };

  const updateConnectorImage = () => {
    connectorFrame = 0;

    const triggerElement = triggerButton.value;
    const popoverElement = getPopoverElement();

    if (!triggerElement || !popoverElement || !isOpen.value) {
      connectorStyle.value = {};
      return;
    }

    const triggerRect = triggerElement.getBoundingClientRect();
    const popoverRect = popoverElement.getBoundingClientRect();

    if (!triggerRect.width || !triggerRect.height || !popoverRect.width || !popoverRect.height) {
      connectorStyle.value = {};
      return;
    }

    const pointerElement = popoverElement.querySelector<HTMLElement>('.field-help-popover-pointer');
    const pointerRect = pointerElement?.getBoundingClientRect();
    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const triggerCenterY = triggerRect.top + triggerRect.height / 2;
    const opensBelow = popoverRect.top >= triggerRect.bottom || popoverRect.top >= triggerCenterY;
    const endX =
      pointerRect && pointerRect.width
        ? pointerRect.left + pointerRect.width / 2
        : popoverRect.left + popoverRect.width / 2;
    const endY =
      pointerRect && pointerRect.height
        ? pointerRect.top + pointerRect.height / 2
        : opensBelow
          ? popoverRect.top - 6
          : popoverRect.bottom + 6;
    const startX = endX >= triggerCenterX ? triggerRect.right + 3 : triggerRect.left - 3;
    const startY = triggerCenterY - 6;
    const distanceX = endX - startX;
    const distanceY = endY - startY;
    const length = Math.hypot(distanceX, distanceY);

    if (length < 24) {
      connectorStyle.value = {};
      return;
    }

    const angle = Math.atan2(distanceY, distanceX);
    const connectorWidth = length;
    const connectorHeight = Math.max(24, Math.min(40, connectorWidth * (140 / 620)));

    connectorStyle.value = {
      '--field-help-connector-image': `url(${dashedArrowImage})`,
      left: `${startX}px`,
      top: `${startY}px`,
      width: `${connectorWidth}px`,
      height: `${connectorHeight}px`,
      transform: `translateY(-50%) rotate(${angle}rad)`,
      transformOrigin: '0 50%',
    };
  };

  const startConnectorTracking = () => {
    stopConnectorTracking(false);
    window.addEventListener('resize', queueConnectorUpdate);
    window.addEventListener('scroll', queueConnectorUpdate, true);

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(queueConnectorUpdate);

      if (triggerButton.value) {
        resizeObserver.observe(triggerButton.value);
      }

      const popoverElement = getPopoverElement();

      if (popoverElement) {
        resizeObserver.observe(popoverElement);
      }
    }
  };

  const stopConnectorTracking = (clearPath = true) => {
    window.removeEventListener('resize', queueConnectorUpdate);
    window.removeEventListener('scroll', queueConnectorUpdate, true);
    resizeObserver?.disconnect();
    resizeObserver = null;

    if (connectorFrame) {
      window.cancelAnimationFrame(connectorFrame);
      connectorFrame = 0;
    }

    if (clearPath) {
      connectorStyle.value = {};
    }
  };

  onMounted(() => {
    window.addEventListener(FIELD_HELP_OPEN_EVENT, handleActivePopoverRequest);
  });

  onBeforeUnmount(() => {
    window.removeEventListener(FIELD_HELP_OPEN_EVENT, handleActivePopoverRequest);
    stopConnectorTracking();
  });
</script>

<template>
  <span v-if="helpContent" class="field-help">
    <button
      ref="triggerButton"
      type="button"
      class="field-help__button"
      :aria-label="helpButtonLabel"
      :aria-expanded="isOpen"
      aria-haspopup="dialog"
      @click.stop="toggleHelp"
      @keydown.esc.stop="closeHelp"
    >
      <span class="field-help__glyph" aria-hidden="true">i</span>
    </button>

    <Popover
      ref="popover"
      class="field-help-popover"
      @show="handlePopoverShow"
      @hide="handlePopoverHide"
    >
      <div
        class="field-help-popover-content"
        role="dialog"
        :aria-label="helpContent.title"
        @keydown.esc.stop="closeHelp"
      >
        <header class="field-help-popover-header">
          <span class="field-help-popover-icon" aria-hidden="true">
            <span class="field-help-popover-icon__glyph">i</span>
          </span>

          <h3 class="field-help-popover-title">
            {{ helpContent.title }}
          </h3>
        </header>

        <p v-if="helpContent.text" class="field-help-popover-description">
          {{ helpContent.text }}
        </p>

        <section v-if="helpContent.importantText" class="field-help-popover-important">
          <h4 class="field-help-popover-important__title">
            {{ helpContent.importantTitle }}
          </h4>

          <p class="field-help-popover-important__text">
            {{ helpContent.importantText }}
          </p>
        </section>

        <ul v-if="helpContent.examples.length" class="field-help-popover-examples">
          <li v-for="example in helpContent.examples" :key="example">
            {{ example }}
          </li>
        </ul>

        <p v-if="helpContent.tip" class="field-help-popover-tip">
          <span class="field-help-popover-tip__icon pi pi-lightbulb" aria-hidden="true" />
          <span>
            <strong>{{ t('field_help.tip_label') }}</strong>
            {{ helpContent.tip }}
          </span>
        </p>
      </div>

      <img
        class="field-help-popover-pointer"
        :src="popoverPointerImage"
        alt=""
        aria-hidden="true"
        draggable="false"
      />
    </Popover>

    <Teleport to="body">
      <span
        v-if="isOpen && connectorStyle.width"
        class="field-help-connector"
        :style="connectorStyle"
        aria-hidden="true"
      />
    </Teleport>
  </span>
</template>

<style scoped>
  .field-help {
    --field-help-icon-bg: var(--PrimaryColor-light);
    --field-help-icon-bg-hover: var(--PrimaryColor-alpha-20);
    --field-help-icon-color: var(--PrimaryColor);
    --field-help-icon-color-hover: var(--SecondaryColor);

    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    line-height: 1;
  }

  .field-help__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    padding: 0;
    border: 1px solid var(--field-help-icon-color);
    border-radius: 50%;
    background: var(--field-help-icon-bg);
    color: var(--field-help-icon-color);
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease,
      color 0.15s ease,
      transform 0.15s ease;
  }

  .field-help__button:hover,
  .field-help__button:focus-visible {
    border-color: var(--field-help-icon-color-hover);
    background: var(--field-help-icon-bg-hover);
    color: var(--field-help-icon-color-hover);
  }

  .field-help__button:focus-visible {
    outline: 2px solid var(--field-help-icon-color);
    outline-offset: 2px;
  }

  .field-help__button:active {
    transform: scale(0.96);
  }

  .field-help__glyph {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 800;
    line-height: 1;
  }

  .field-help-popover-content {
    box-sizing: border-box;
    width: 100%;
    padding: 1rem;
    color: var(--gray-900);
  }

  .field-help-popover-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-block-end: 0.65rem;
  }

  .field-help-popover-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    background: var(--field-help-icon-bg);
    color: var(--field-help-icon-color);
  }

  .field-help-popover-icon__glyph {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 800;
    line-height: 1;
  }

  .field-help-popover-title {
    margin: 0;
    color: var(--gray-900);
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.35;
    letter-spacing: 0;
  }

  .field-help-popover-description {
    margin: 0;
    color: var(--gray-700);
    font-size: 0.875rem;
    line-height: 1.6;
    letter-spacing: 0;
  }

  .field-help-popover-important {
    margin-block-start: 0.875rem;
    padding: 0.75rem;
    border: 1px solid var(--field-help-important-border);
    border-radius: 0.75rem;
    background: var(--field-help-important-bg);
  }

  .field-help-popover-important__title {
    margin: 0 0 0.35rem;
    color: var(--field-help-important-title);
    font-size: 0.875rem;
    font-weight: 700;
    line-height: 1.35;
    letter-spacing: 0;
  }

  .field-help-popover-important__text {
    margin: 0;
    color: var(--field-help-important-text);
    font-size: 0.875rem;
    line-height: 1.6;
    letter-spacing: 0;
  }

  .field-help-popover-examples {
    margin: 0.75rem 0 0;
    padding-inline-start: 1rem;
    color: var(--gray-600);
    font-size: 0.8125rem;
    line-height: 1.5;
  }

  .field-help-popover-tip {
    display: flex;
    gap: 0.5rem;
    margin: 0.875rem 0 0;
    color: var(--gray-700);
    font-size: 0.8125rem;
    line-height: 1.45;
    letter-spacing: 0;
  }

  .field-help-popover-tip__icon {
    flex: 0 0 auto;
    margin-block-start: 0.05rem;
    color: var(--SecondaryColor);
    font-size: 0.95rem;
  }

  :global(.field-help-popover) {
    --field-help-icon-bg: var(--PrimaryColor-light);
    --field-help-icon-color: var(--PrimaryColor);
    --field-help-popover-bg: var(--white);
    --field-help-popover-border: var(--PrimaryColor-alpha-20);
    --field-help-popover-shadow: 0 12px 32px var(--PrimaryColor-alpha-15);
    --field-help-important-bg: var(--PrimaryColor-alpha-8);
    --field-help-important-border: var(--PrimaryColor-alpha-30);
    --field-help-important-title: var(--PrimaryColor);
    --field-help-important-text: var(--gray-900);

    width: min(19.5rem, calc(100vw - 2rem));
    border: 1px solid var(--field-help-popover-border);
    border-radius: 1rem;
    background: var(--field-help-popover-bg);
    box-shadow: var(--field-help-popover-shadow);
    color: var(--gray-900);
    overflow: visible;
    position: absolute;
    z-index: 1200;
  }

  :global(.field-help-popover::before),
  :global(.field-help-popover::after) {
    content: none !important;
    display: none !important;
  }

  :global(.field-help-popover .p-popover-content) {
    position: relative;
    z-index: 2;
    padding: 0;
    border-radius: inherit;
    background: var(--field-help-popover-bg);
  }

  :global(.field-help-popover .p-popover-arrow) {
    display: none;
  }

  :global(.field-help-popover .field-help-popover-pointer) {
    display: block;
    position: absolute;
    top: -0.8125rem;
    left: 50%;
    z-index: 3;
    width: 2rem;
    height: 1rem;
    object-fit: contain;
    pointer-events: none;
    transform: translateX(-50%);
    user-select: none;
  }

  :global(.field-help-popover.p-popover-flipped .field-help-popover-pointer) {
    top: auto;
    bottom: -0.8125rem;
    transform: translateX(-50%) rotate(180deg);
  }

  :global([dir='rtl'] .field-help-popover .field-help-popover-pointer) {
    right: auto;
    left: 50%;
    transform: translateX(-50%);
  }

  :global([dir='rtl'] .field-help-popover.p-popover-flipped .field-help-popover-pointer) {
    transform: translateX(-50%) rotate(180deg);
  }

  :global(.field-help-connector) {
    position: fixed;
    pointer-events: none;
    background: var(--PrimaryColor);
    mask: var(--field-help-connector-image) 0 50% / 100% 100% no-repeat;
    z-index: 1199;
    -webkit-mask: var(--field-help-connector-image) 0 50% / 100% 100% no-repeat;
  }

  :global(.field-help-label-row) {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    min-width: 0;
    vertical-align: middle;
  }

  :global(.field-help-label-row--block) {
    display: flex;
  }
</style>
