<script setup lang="ts">
import { ref } from 'vue'
// import Notification from '../../icons/Notification.vue'
import { useToast } from 'primevue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import Popover from 'primevue/popover'
import type { EnrichedNotification } from '@/services/WebSocketNotificationService'
import { NotificationEnum } from '@/services/Enums/NotificationEnum.ts'
// import Notification from '@/shared/icons/Notification.vue'
import { useIntegratedNotifications } from '@/composable/useIntegratedNotifications'
import wordSlice from '@/base/Presentation/Utils/word_slice'
import HeaderNotificationIcon from '@/shared/icons/HeaderIcons/HeaderNotificationIcon.vue'
// import { NOTIFICATION_SOUND_BASE64 } from '@/base/Presentation/utils/notification_ring.ts'

const op = ref()
const toggle = (event: Event) => {
  op.value.toggle(event)
}
const toast = useToast()
const userStore = useUserStore() // Already defined above
const router = useRouter()
// Notification sound

const getNotificationPayload = (notification: EnrichedNotification) => {
  const body = notification.body
  const bodyItem = Array.isArray(body) ? body[0] : undefined
  const parsedBodyItem = Array.isArray(notification.parsedBody)
    ? notification.parsedBody[0]
    : undefined
  const parsedData = !Array.isArray(notification.parsedBody)
    ? notification.parsedBody?.data
    : undefined

  return {
    type: Number(
      notification.routeType ??
        notification.data?.type ??
        bodyItem?.type ??
        parsedBodyItem?.type ??
        parsedData?.type,
    ),
    typeId: Number(
      notification.routeTypeId ??
        notification.data?.type_id ??
        bodyItem?.type_id ??
        parsedBodyItem?.type_id ??
        parsedData?.type_id,
    ),
    title:
      notification.title ||
      bodyItem?.title ||
      parsedBodyItem?.title ||
      notification.parsedBody?.title ||
      'New Notification',
    message:
      notification.displayMessage ||
      bodyItem?.message ||
      parsedBodyItem?.message ||
      notification.parsedBody?.message ||
      notification.message ||
      '',
  }
}
const NOTIFICATION_SOUND_BASE64 =
  'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIF2W56+mmUBELTKXh8bllHAU2jdXvyn0tBSh+zPLaizsKGGS46Om1XBoFM4nU8c1+LgYngM3y3I4+ChlluOvpplARC0ul4fG5ZRwFNo3V78p9LQUofszy2os7ChhluevrpVERC0yn4fG3ZBwFOI7U8ct+LQUoftDy24k7ChZluujoplARDEul4e+3ZRwGOY/V8Mp/LgYpf9Dy3Ik7CxZluejpplARDEym4fG3ZBwFOI/V8cp+LQYoftDy24o7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuujqplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/'

// Integrate new notification system
const { notifications, unreadCount, acknowledgeNotification, wsConnected } =
  useIntegratedNotifications({
    autoConnect: true,
    token: userStore.user?.WebSocketToken,
    userId: userStore.user?.id,
    fetchNotifications: true,
    userToken: userStore.user?.apiToken,
    onNotification: (notification:any) => {
      const payload = getNotificationPayload(notification)
      const audio = new Audio(NOTIFICATION_SOUND_BASE64)
      audio.play()

      toast.add({
        severity: 'info',
        summary: payload.title,
        detail: payload.message,
        life: 5000,
      })
    },
  })

const handleNotificationClick = (notification: EnrichedNotification) => {
  const payload = getNotificationPayload(notification)
  navigateToNotification(payload.type, payload.typeId)
  op.value?.hide?.()
}

const navigateToNotification = (notificationType: number, typeId?: number) => {
  switch (notificationType) {
    case NotificationEnum.OBSERVATION: // PDSP
      router.push(
        typeId
          ? `/organization/equipment-mangement/observation/show/${typeId}?type=2`
          : '/organization/equipment-mangement/observation?isAll=1&type=2',
      )
      break
    case NotificationEnum.INCIDENT: // PDSP
      router.push(
        typeId
          ? `/organization/equipment-mangement/incedant/show/${typeId}`
          : '/organization/equipment-mangement/incedant?isAll=1',
      )
      break
    case NotificationEnum.TASK: // PDSP
      router.push(
        typeId
          ? `/organization/equipment-mangement/inspection?inspectionType=2&typeId=${typeId}`
          : '/organization/equipment-mangement/inspection?inspectionType=2',
      )

      break

    case NotificationEnum.PROJECT: // PDSP
      router.push(
        typeId
          ? { name: 'Project Details', params: { id: typeId }, query: { type: '1' } }
          : '/organization/projects',
      )

      break

    default:
      console.warn('Unknown notification type:', notificationType)
  }
}
</script>
<template>
  <button class="notification" type="button" @click="toggle">
    <div class="circle-icon cursor-pointer">
      <HeaderNotificationIcon />
    </div>
    <span v-if="wsConnected" class="status-dot connected"></span>
    <span v-else class="status-dot disconnected"></span>
    <span v-if="unreadCount > 0" class="notification-count">
      {{ unreadCount }}
    </span>
  </button>
  <Popover ref="op">
    <div class="list-notifaction-body">
      <ul class="list-notifaction">
        <li v-if="notifications.length === 0" class="list-notifaction-item empty-msg">
          No new notifications
        </li>
        <li
          v-for="notification in notifications"
          :key="notification.id"
          class="list-notifaction-item"
          :class="{ 'new-item': notification.status === 'PENDING' }"
        >
          <div class="notification-content-wrapper">
            <button @click="handleNotificationClick(notification)" class="notification-text">
              <strong>{{ wordSlice(getNotificationPayload(notification).title, 25) }}</strong>
              <p>
                {{ getNotificationPayload(notification).message }}
                <!-- {{ wordSlice(JSON.parse(notification?.body!)?.message, 35) }} -->
              </p>
              <small v-if="notification.receivedAt">{{
                notification.receivedAt.toLocaleTimeString()
              }}</small>
            </button>
            <!-- <button @click="acknowledgeNotification(notification.id)" class="remove-btn">
              &times;
            </button> -->
          </div>
        </li>
        <!--
        <li>
            <router-link class="list-notifaction-item align-center" to="/my-remainders">
                <span>See All</span>
            </router-link>
        </li>
        -->
      </ul>
    </div>
  </Popover>
</template>
<style lang="scss" scoped>
.p-popover {
  border-radius: 16px !important;
}

.p-dialog-content {
  padding: 0;
}

.decoration-button {
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 0 5px 5px color-mix(in srgb, var(--text-strong) 10%, transparent);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  border: none;
  cursor: pointer;

  svg {
    animation: rotate 2s linear infinite;
    width: 25px;
    height: 25px;
    fill: var(--primary-color) !important;

    path {
      fill: var(--primary-color) !important;
    }
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Notification Button */
.notification {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid color-mix(in srgb, var(--surface-1) 10%, transparent);
}

.notification:hover {
  background: color-mix(in srgb, var(--surface-1) 10%, transparent);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px color-mix(in srgb, var(--text-strong) 10%, transparent);
}

.notification:active {
  transform: translateY(0);
}

/* Status Dot */
.status-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid var(--surface-1);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.status-dot.connected {
  background: var(--status-success);
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--status-success) 70%, transparent);
}

.status-dot.disconnected {
  background: var(--status-danger);
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--status-danger) 70%, transparent);
  animation: none;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--status-success) 70%, transparent);
  }

  50% {
    box-shadow: 0 0 0 6px transparent;
  }
}

/* Notification Count Badge */
.notification-count {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--danger-color) 0%, var(--danger-color) 100%);
  color: var(--text-on-brand);
  font-size: 11px;
  font-weight: 600;
  border-radius: 10px;
  border: 2px solid var(--surface-1);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--brand-primary-400) 40%, transparent);
  animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Popover Container */
.list-notifaction-body {
  width: 380px;
  max-height: 500px;
  background: var(--surface-1);
  border-radius: 16px;
  box-shadow:
    0 20px 60px color-mix(in srgb, var(--shadow-color) 15%, transparent),
    0 0 0 1px color-mix(in srgb, var(--shadow-color) 5%, transparent);
  overflow: hidden;
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* List */
.list-notifaction {
  list-style: none;
  margin: 0;
  padding: 8px;
  max-height: 500px;
  overflow-y: auto;
}

.list-notifaction::-webkit-scrollbar {
  width: 6px;
}

.list-notifaction::-webkit-scrollbar-track {
  background: transparent;
}

.list-notifaction::-webkit-scrollbar-thumb {
  background: var(--main-border);
  border-radius: 3px;
}

.list-notifaction::-webkit-scrollbar-thumb:hover {
  background: var(--brand-secondary-700);
}

/* List Items */
.list-notifaction-item {
  margin-bottom: 4px;
  border-radius: 12px;
  padding: 12px;
  transition: all 0.2s ease;
}

.list-notifaction-item:last-child {
  margin-bottom: 0;
}

/* Empty Message */
.empty-msg {
  padding: 48px 24px;
  text-align: center;
  color: var(--text-soft);
  font-size: 14px;
}

/* Notification Item */
.list-notifaction-item.new-item {
  position: relative;
  padding: 12px;
  background: var(--brand-primary-50);
  cursor: pointer;
}

.list-notifaction-item.new-item:hover {
  background: var(--brand-primary-50);
  transform: translateX(4px);
}

.list-notifaction-item.new-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color) 100%);
  border-radius: 0 3px 3px 0;
}

/* Notification Content */
.notification-content-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.notification-text {
  flex: 1;
  width: 100%;
  // min-width: 0;
}

.notification-text strong {
  display: block;
  color: var(--brand-primary-900);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-text p {
  color: var(--text-soft);
  font-size: 13px;
  line-height: 1.5;
  margin: 0 0 6px 0;
  word-wrap: break-word;
}

.notification-text small {
  color: var(--text-soft);
  font-size: 11px;
  font-weight: 500;
}

/* Remove Button */
.remove-btn {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-soft);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.6;
}

.remove-btn:hover {
  background: var(--status-danger);
  color: var(--text-on-brand);
  opacity: 1;
  transform: rotate(90deg);
}

.remove-btn:active {
  transform: rotate(90deg) scale(0.9);
}

/* Link Item (commented out in your code) */
.align-center {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: var(--brand-primary-400);
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.align-center:hover {
  background: var(--brand-primary-50);
  color: var(--brand-accent-500);
}

/* Responsive */
@media (max-width: 480px) {
  .list-notifaction-body {
    width: calc(100vw - 32px);
    max-width: 380px;
  }
}

.clicked {
  background-color: var(--primary-color-opacity-1);
  color: var(--primary-color);
}

.year-selector-btn {
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 0 5px 5px color-mix(in srgb, var(--text-strong) 10%, transparent);
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;

  svg {
    width: 20px;
    height: 20px;
    stroke: var(--primary-color);
  }

  .year-text {
    font-weight: 600;
    color: var(--primary-color);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 10px color-mix(in srgb, var(--text-strong) 15%, transparent);

    .year-text {
      color: var(--text-on-brand);
    }

    svg {
      stroke: var(--text-on-brand);

      path {
        fill: var(--text-on-brand);
      }
    }
  }
}

.year-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 0;
}

.year-option {
  padding: 1rem;
  border: 2px solid var(--surface-2);
  border-radius: 8px;
  background-color: var(--text-on-brand);
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--primary-color);
    background-color: var(--primary-color-opacity-1);
    transform: translateX(5px);
  }

  &.year-option-active {
    border-color: var(--primary-color);
    background-color: var(--primary-color);
    color: var(--text-on-brand);

    &:hover {
      background-color: var(--primary-color);
      transform: translateX(0);
    }
  }
}

.text-header {
  h1 {
    font-family: 'header-text', sans-serif;
    text-transform: lowercase;
    font-size: 2rem;
    text-align: center;
    display: -webkit-flex;
    display: flex;
    -webkit-align-items: center;
    align-items: center;
    -webkit-justify-content: center;
    justify-content: center;
    margin: 0;
    // min-height: calc(100vh - 16px);
    // background: var(--surface-1);
    position: relative;
    // background: var(--brand-secondary-900);
    // color: var(--text-strong);
    animation: movement 1s ease-in-out infinite alternate;

    @keyframes movement {
      0% {
        transform: translateY(0);
      }

      50% {
        transform: translateY(-5px);
      }

      100% {
        transform: translateY(0px);
      }
    }
  }

  h1:before {
    content: attr(data-text);
    position: absolute;
    background: linear-gradient(var(--brand-primary-700), var(--text-strong), var(--brand-primary-400), var(--brand-primary-700), var(--brand-primary-500), var(--brand-accent-500));
    -webkit-background-clip: text;
    color: transparent;
    background-size: 100% 90%;
    line-height: 0.9;
    clip-path: ellipse(120px 120px at -2.54% -9.25%);
    animation: swing 5s infinite;
    animation-direction: alternate;
  }

  @keyframes swing {
    0% {
      -webkit-clip-path: ellipse(120px 120px at -2.54% -9.25%);
      clip-path: ellipse(120px 120px at -2.54% -9.25%);
    }

    50% {
      -webkit-clip-path: ellipse(120px 120px at 49.66% 64.36%);
      clip-path: ellipse(120px 120px at 49.66% 64.36%);
    }

    100% {
      -webkit-clip-path: ellipse(120px 120px at 102.62% -1.61%);
      clip-path: ellipse(120px 120px at 102.62% -1.61%);
    }
  }
}
</style>
