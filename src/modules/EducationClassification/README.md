# Employee Email CRUD Module

A complete CRUD implementation for managing employee emails in your application. This module follows the base architecture pattern with Repository, Controller, and API Service layers.

## 📁 Module Structure

```
src/modules/employee-email/
├── core/
│   ├── constants/
│   │   └── email_type.enum.ts       # EmailType enum
│   ├── models/
│   │   └── email.model.ts           # EmailModel class
│   └── params/
│       └── email.params.ts          # EmailParams for API requests
├── data/
│   ├── api/
│   │   └── email.api-service.ts     # API Service for HTTP calls
│   └── repositories/
│       └── email.repository.ts      # Repository for data operations
├── presentation/
│   ├── controllers/
│   │   └── email.controller.ts      # Controller for business logic
│   └── components/
│       └── EmailCrudExample.vue     # Example Vue component
└── index.ts                          # Module exports
```

## 🚀 Quick Start

### 1. Import the module

```typescript
import {
  EmailController,
  EmailParams,
  EmailType,
  EmailModel,
  getEmailTypeName,
} from '@/modules/employee-email';
```

### 2. Get the controller instance

```typescript
const emailController = EmailController.getInstance();
```

### 3. Perform CRUD operations

#### **Fetch all emails**

```typescript
await emailController.fetchList();

// Access data
const emails = emailController.listData.value; // EmailModel[] | null
```

#### **Fetch emails for a specific employee**

```typescript
await emailController.fetchEmployeeEmails(employeeId);
```

#### **Fetch single email by ID**

```typescript
await emailController.fetchOne(emailId);

// Access data
const email = emailController.itemData.value; // EmailModel | null
```

#### **Create new email**

```typescript
const params = new EmailParams('john@example.com', EmailType.EMPLOYEE);
await emailController.create(params);
```

#### **Update email**

```typescript
const params = new EmailParams('john.updated@example.com', EmailType.WORK);
await emailController.update(emailId, params);
```

#### **Delete email**

```typescript
await emailController.delete(emailId);
```

## 📊 Data Models

### EmailType Enum

```typescript
export enum EmailType {
  EMPLOYEE = 'employee',
  PERSONAL = 'personal',
  WORK = 'work',
  OTHER = 'other',
}
```

### EmailModel Class

```typescript
class EmailModel {
  public id?: number;
  public email: string;
  public type: EmailType;
  public employeeId?: number;
  public createdAt?: string;
  public updatedAt?: string;
}
```

### EmailParams Class

```typescript
class EmailParams {
  public email: string;
  public type: EmailType;
  public employeeId?: number;

  constructor(email: string, type: EmailType = EmailType.EMPLOYEE, employeeId?: number);
  toMap(): { [key: string]: any };
}
```

## 🎯 Usage in Vue Components

### Using with script setup

```vue
<script setup lang="ts">
  import { onMounted } from 'vue';
  import { EmailController, EmailParams, EmailType } from '@/modules/employee-email';

  const controller = EmailController.getInstance();

  onMounted(async () => {
    await controller.fetchList();
  });

  async function addEmail() {
    const params = new EmailParams('user@example.com', EmailType.EMPLOYEE);
    await controller.create(params);

    if (controller.isItemSuccess()) {
      // Success! Refresh list
      await controller.fetchList();
    }
  }
</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="controller.isListLoading()">Loading...</div>

    <!-- Email list -->
    <div v-else-if="controller.listData.value">
      <div v-for="email in controller.listData.value" :key="email.id">
        {{ email.email }} - {{ email.type }}
      </div>
    </div>

    <!-- Error state -->
    <div v-if="controller.errorMessage.value">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>
```

## 🔧 API Endpoints

The module uses the following API endpoints (configured in `apiNames.ts`):

| Operation     | Method    | Endpoint                                 |
| ------------- | --------- | ---------------------------------------- |
| Index (List)  | GET       | `organization/fetch_employee_emails`     |
| Show (Single) | GET       | `organization/show_employee_email/:id`   |
| Create        | POST      | `organization/store_employee_email`      |
| Update        | PUT/PATCH | `organization/update_employee_email/:id` |
| Delete        | DELETE    | `organization/delete_employee_email/:id` |

## 📝 Controller Features

The EmailController extends BaseController and provides:

- ✅ **Reactive State Management** - Vue reactive refs for list and item states
- ✅ **Loading States** - Built-in loading indicators
- ✅ **Error Handling** - Automatic error state management
- ✅ **Success/Error Dialogs** - Configurable user feedback
- ✅ **Pagination Support** - For large email lists
- ✅ **Retry Logic** - Automatic retry for failed requests

### State Checks

```typescript
// Check loading states
controller.isListLoading(); // boolean
controller.isItemLoading(); // boolean

// Check success states
controller.isListSuccess(); // boolean
controller.isItemSuccess(); // boolean

// Check error states
controller.isListFailed(); // boolean
controller.isItemFailed(); // boolean

// Access error message
controller.errorMessage.value; // string | null
```

### Controller Configuration

```typescript
// Override config in your controller instance
protected get config(): ControllerConfig {
  return {
    showLoadingDialog: false,    // Show loading dialog
    showSuccessDialog: true,     // Show success notifications
    showErrorDialog: true,       // Show error notifications
    autoRetry: false,            // Auto-retry failed requests
    maxAutoRetries: 2,           // Max retry attempts
  };
}
```

## 🛠 Customization

### Adding Custom Methods to Controller

```typescript
// In email.controller.ts
async fetchEmailsByType(type: EmailType) {
  return this.fetchList(undefined, {
    details: { type },
  });
}
```

### Adding Custom API Endpoints

```typescript
// In email.api-service.ts
async verifyEmail(emailId: number) {
  return this.custom({
    url: `${this.apiNames.baseUrl}/verify_employee_email/${emailId}`,
    method: CrudType.POST,
  });
}
```

## 🧪 Example Component

See `EmailCrudExample.vue` for a complete working example with:

- Email list display
- Add/Edit form
- Delete confirmation
- Error handling
- Loading states

## 📦 Dependencies

This module depends on:

- Base architecture (`@/base/`)
  - `BaseController`
  - `BaseRepository`
  - `BaseApiService`
  - `Params` interface
  - DataState management

## 🤝 Contributing

When extending this module:

1. Follow the existing architecture patterns
2. Add proper TypeScript types
3. Include JSDoc comments for public methods
4. Update this README with new features

## 📄 License

Part of the new-base project.
