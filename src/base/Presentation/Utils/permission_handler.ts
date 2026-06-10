// import { useUserStore } from '@/stores/user';
// import { type PermissionsEnum } from '@/features/dashboard/users/employee/Core/Enum/permission_enum';

// export default class PermissionHandler {
//   private static _instance: PermissionHandler;

//   private userStore = useUserStore();

//   static get Instance(): PermissionHandler {
//     if (!this._instance) {
//       this._instance = new PermissionHandler();
//     }
//     return this._instance;
//   }

//   handle(code: PermissionsEnum[]): boolean {
//     const handlePermission = true;
//     const user = this.userStore.user!;

//     if (handlePermission && user) {
//       if (user.isMaster === 1) {
//         return true;
//       } else {
//         // Check if ANY permission in the code array exists in user's permissions
//         return code.some((permission) => user.permission?.includes(permission));
//       }
//     } else {
//       return true;
//     }
//   }

//   except(code: PermissionsEnum): boolean {
//     const handlePermission = true;
//     const user = this.userStore.user!;
//     // return false;
//     if (handlePermission && user) {
//       if (user.isMaster === 1) {
//         return true;
//       } else {
//         return !user.permission?.includes(code);
//       }
//     } else {
//       return true;
//     }
//   }
// }
