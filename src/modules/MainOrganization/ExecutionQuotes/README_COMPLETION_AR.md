# ExecutionQuotes - create flow split into two requests

النسخة دي تفصل إنشاء مقايسة التنفيذ إلى خطوتين، بنفس نمط الـ Base / Repository / Controller الموجود في المشروع وبدون أي Composable جديد.

## 1) حفظ الجزء الأساسي أولاً

Endpoint الموجود:

```text
POST store_execution_quote
```

Payload - تنفيذ فقط:

```json
{
  "client_id": 1,
  "project_id": 5,
  "quote_type": 2,
  "quote_source": 1,
  "price_employee_id": 4
}
```

Payload - تنفيذ من مقايسة تصميم:

```json
{
  "client_id": 1,
  "project_id": 5,
  "quote_type": 2,
  "quote_source": 2,
  "design_quote_id": 10
}
```

الـ response لازم يرجع `data.id` للمقايسة الجديدة. بعد نجاح هذا الطلب فقط يتم فتح الـ Builder ويتم قفل حقول الجزء الأساسي حتى لا تختلف بيانات الـ frontend عن السجل المحفوظ.

## 2) حفظ نوع المقايسة + المراحل + البنود

Endpoint جديد مطلوب من الـ backend:

```text
POST store_execution_quote_details
```

تم تنفيذه في الـ frontend بنفس نمط `customPost` المستخدم داخل Products للـ custom actions.

Payload:

```json
{
  "execution_quote_id": 28,
  "quote_type": 1,
  "stages": [
    {
      "stage_id": 152,
      "client_price": 52000,
      "items": [
        {
          "stage_id": 153,
          "source_type": 1,
          "source_id": 16,
          "sorting_id": 45,
          "quantity": 1,
          "unit_price": 1000
        },
        {
          "stage_id": 153,
          "source_type": 2,
          "source_id": 37,
          "quantity": 120,
          "unit_price": 5000
        },
        {
          "stage_id": 153,
          "source_type": 3,
          "source_id": 6,
          "quantity": 32,
          "unit_price": 25000
        }
      ]
    }
  ]
}
```

`sorting_id` يتم إرساله للمنتج فقط عند اختيار فرز. المنتجات التي لا تحتوي على فرز، ومواد البناء، والمصنعيات لا ترسل هذا المفتاح.

## الملفات الأساسية في الفصل الجديد

- `core/params/add.execution.quote.params.ts`
  - مسؤول عن request الأول فقط.
- `core/params/store.execution.quote.details.params.ts`
  - مسؤول عن request الثاني فقط.
- `data/api/execution.quote.api-service.ts`
  - يحتوي `storeDetails()` باستخدام `customPost`.
- `data/api/execution.quote.api.endpoints.ts`
  - يحتوي `storeDetails = store_execution_quote_details`.
- `data/repositories/execution.quote.repository.ts`
  - يمرر `storeDetails()` للـ API service.
- `presentation/controllers/execution.quote.controller.ts`
  - `createBase()` يحفظ الجزء الأول بدون redirect.
  - `storeDetails()` يحفظ الجزء الثاني ثم يعمل redirect للـ index عند النجاح.
- `presentation/components/ExecutionQuoteAdd.vue`
  - يدير المرحلتين والـ `executionQuoteId`.
- `presentation/components/ExecutionQuoteForm.vue`
  - الـ Builder لا يظهر إلا بعد نجاح request الأول.

## Stages

Main Stage و Sub Stage ما زالوا نفس resource ونفس `StageController`.

- Main stages: `parentId: null`
- Sub stages: `parentId: selectedMainStageId`

عند اختيار Main Stage ينتقل الـ wizard إلى المسار:

```text
execution-quotes/add/stages/:stageId
```

المسار الأساسي ومسار المرحلة يستخدمان نفس route record حتى تظل بيانات المقايسة الحالية في الذاكرة أثناء التنقل. فتح رابط مرحلة مباشرة بدون حفظ بيانات المقايسة يعرض تنبيهاً ثم يعيد المستخدم إلى `execution-quotes/add`.

## قيم الـ enums

القيم المرسلة للباك رقمية:

```text
quote_type: 1 = lump sum, 2 = supervision
source_type: 1 = product, 2 = building material, 3 = labor
```

## ملاحظة Backend

الـ frontend يفترض أن response الخاص بطلب حفظ بيانات المقايسة الأساسي يرجع الـ id داخل الـ parsed `data` حتى يمكن ربط طلب التفاصيل به.

الـ endpoint الجديد `store_execution_quote_details` غير موجود في الباك حالياً حسب متطلبات المهمة، لذلك يجب على الـ backend تنفيذه وفق الـ payload أعلاه.
