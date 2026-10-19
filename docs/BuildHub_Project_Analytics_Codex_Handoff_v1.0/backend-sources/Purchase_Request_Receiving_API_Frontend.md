# Purchase Request Receiving API — Frontend Handoff

> **Feature:** Purchase Request Receiving (Partial / Complete)  
> **Authentication:** Employee (`auth:employee`)  
> **Request content type:** `application/json`  
> **API actions:** `store_purchase_request_receipt`, `fetch_purchase_request_receipts`  
> **Important:** The full route URL/prefix was not provided; use the existing backend route definitions. Both actions follow the project's POST-action API convention.

## 1. Overview

بعد تأكيد أمر الشراء، يمكن تسجيل استلام الأصناف على **دفعات متعددة**، وليس من الضروري استلام جميع الكميات مرة واحدة. كل دفعة تُحفظ كسجل استلام مستقل، ويحسب الـBackend إجمالي المستلم والمتبقي لكل صنف.

| Receipt status | Value | Meaning |
|---|---:|---|
| `PARTIAL` | `1` | لا يزال هناك صنف واحد على الأقل له كمية متبقية. |
| `COMPLETE` | `2` | جميع كميات أصناف طلب الاحتياج استُلمت بالكامل. |

- **حالة الاستلام تُحسب تلقائيًا في الـBackend**؛ لا ترسل `status` في طلب الـStore.
- حالة طلب الاحتياج الأصلية (`purchase_requests.status`) مختلفة عن حالة الاستلام، ولا تتغير بسبب الاستلام.
- حالة كل استلام محفوظة تاريخيًا: قد تكون الدفعات الأولى `PARTIAL` والأخيرة `COMPLETE`.
- لا يمكن إضافة استلام بعد اكتمال جميع الكميات.

---

## 2. Store Purchase Request Receipt

**Action:** `store_purchase_request_receipt`  
**HTTP method:** `POST` (وفق نمط الـActions الحالي بالمشروع)

### Request — with `employee_id`

```json
{
  "purchase_request_id": 5,
  "employee_id": 7,
  "date": "2026-10-15",
  "items": [
    {
      "purchase_request_item_id": 9,
      "quantity": 1
    },
    {
      "purchase_request_item_id": 10,
      "quantity": 0
    }
  ]
}
```

> **تنبيه مهم بخصوص المثال الفعلي:** الـRequest أعلاه منقول كما أُرسل، لكنه يحتوي على `quantity: 0` للصنف رقم `10`. **حسب قواعد الـValidation التي اتفقنا عليها سابقًا، الكمية يجب أن تكون أكبر من صفر**؛ لذلك لا ينبغي للفرونت إرسال هذا العنصر بكمية صفر. لا يمكن الجزم من الـFetch response وحده إن كان الـBackend الحالي يرفض الصفر أو يتجاهله؛ **يجب تأكيد السلوك الفعلي قبل الاعتماد عليه**.

### Recommended valid request — receive only item `9`

```json
{
  "purchase_request_id": 5,
  "employee_id": 7,
  "date": "2026-10-15",
  "items": [
    {
      "purchase_request_item_id": 9,
      "quantity": 1
    }
  ]
}
```

### Request — without `employee_id`

```json
{
  "purchase_request_id": 5,
  "date": "2026-10-15",
  "items": [
    {
      "purchase_request_item_id": 9,
      "quantity": 1
    }
  ]
}
```

### Request fields

| Field | Type | Required | Description |
|---|---|---|---|
| `purchase_request_id` | integer | Yes | رقم طلب الاحتياج، ويجب أن يخص نفس الـOrganization. |
| `employee_id` | integer \| null | No | مسؤول الاستلام؛ عند عدم الإرسال أو إرسال `null` يُستخدم الموظف الحالي من `auth('employee')`. |
| `date` | string (`YYYY-MM-DD`) | Yes | تاريخ الاستلام. |
| `items` | array | Yes | صنف واحد على الأقل **بكمية موجبة**. ليس مطلوبًا إرسال كل الأصناف. |
| `items[].purchase_request_item_id` | integer | Yes | `id` من جدول `purchase_request_items`، **وليس** Product ID أو Material ID. |
| `items[].quantity` | decimal (max 2 fraction digits) | Yes | الكمية التي تم استلامها **في هذه الدفعة فقط**؛ يجب أن تكون `> 0` ولا تتجاوز الكمية المتبقية. |

**Employee rules:**

- إذا أُرسل `employee_id` صالح، يُستخدم كما هو بعد التحقق من تبعيته لنفس الـOrganization.
- إذا لم يُرسل، أو كان `null`، يُستخدم رقم الموظف المسجل دخوله.
- `organization_employee_id` هو منفّذ العملية المسجل دخوله دائمًا، حتى لو اختار مسؤول استلام مختلفًا.

### Store business rules

- يجب أن يكون أمر الشراء مؤكدًا (Confirmed Purchase Order) حتى يُسمح بالاستلام.
- يمكن استلام صنف واحد أو أكثر في كل دفعة.
- نفس الصنف مسموح في دفعات مختلفة، لكن لا يُكرر داخل **نفس** `items`.
- لا تقبل كمية `0` أو كمية سالبة أو كمية أكبر من المتبقي بحسب القواعد المعتمدة.
- في حالة خطأ أي صنف، تفشل عملية الاستلام بالكامل دون حفظ جزئي.
- لا تُرسل `status`، أو `organization_id`، أو `organization_employee_id` من الفرونت.
- **لم يُرفق Store API response في البيانات المقدمة**؛ لا تفترض شكله قبل مراجعته من الـBackend.

---

## 3. Fetch Purchase Request Receipts

**Action:** `fetch_purchase_request_receipts`  
**HTTP method:** `POST` (وفق نمط الـActions الحالي بالمشروع)

### Request

```json
{
  "purchase_request_id": 5
}
```

### Actual response provided

```json
{
  "status": true,
  "message": "Purchase request receipts fetched successfully.",
  "data": {
    "purchase_request_id": 5,
    "status": 2,
    "items_summary": [
      {
        "purchase_request_item": {
          "id": 9,
          "project_timeline_stage": {
            "id": 17,
            "stage": {
              "id": 129,
              "title": "منعم"
            },
            "sub_stage": null,
            "created_at": "2026-10-11 11:33:28"
          },
          "itemable_type": "material",
          "itemable": {
            "id": 5,
            "title": "run"
          },
          "quantity": "10.00"
        },
        "requested_quantity": "10.00",
        "received_quantity": "10.00",
        "remaining_quantity": "0.00"
      },
      {
        "purchase_request_item": {
          "id": 10,
          "project_timeline_stage": {
            "id": 17,
            "stage": {
              "id": 129,
              "title": "منعم"
            },
            "sub_stage": null,
            "created_at": "2026-10-11 11:33:28"
          },
          "itemable_type": "product",
          "itemable": {
            "id": 36,
            "title": "zzzzzzz"
          },
          "quantity": "5.00"
        },
        "requested_quantity": "5.00",
        "received_quantity": "5.00",
        "remaining_quantity": "0.00"
      }
    ],
    "receipts": [
      {
        "id": 1,
        "purchase_request_id": 5,
        "employee": {
          "id": 7,
          "name": "Magee Colon",
          "type": 2
        },
        "organization_employee": {
          "id": 1,
          "name": "Techlab Employee",
          "type": 1
        },
        "status": 1,
        "date": "2026-10-15",
        "items": [
          {
            "id": 1,
            "purchase_request_item_id": 9,
            "quantity": "8.00"
          },
          {
            "id": 2,
            "purchase_request_item_id": 10,
            "quantity": "3.00"
          }
        ],
        "created_at": "2026-10-15 08:03:48"
      },
      {
        "id": 2,
        "purchase_request_id": 5,
        "employee": {
          "id": 7,
          "name": "Magee Colon",
          "type": 2
        },
        "organization_employee": {
          "id": 1,
          "name": "Techlab Employee",
          "type": 1
        },
        "status": 1,
        "date": "2026-10-15",
        "items": [
          {
            "id": 3,
            "purchase_request_item_id": 9,
            "quantity": "1.00"
          },
          {
            "id": 4,
            "purchase_request_item_id": 10,
            "quantity": "2.00"
          }
        ],
        "created_at": "2026-10-15 08:05:08"
      },
      {
        "id": 3,
        "purchase_request_id": 5,
        "employee": {
          "id": 7,
          "name": "Magee Colon",
          "type": 2
        },
        "organization_employee": {
          "id": 1,
          "name": "Techlab Employee",
          "type": 1
        },
        "status": 2,
        "date": "2026-10-15",
        "items": [
          {
            "id": 5,
            "purchase_request_item_id": 9,
            "quantity": "1.00"
          }
        ],
        "created_at": "2026-10-15 08:06:17"
      }
    ]
  }
}
```

### Fetch response fields

| Field | Type | Description |
|---|---|---|
| `status` | boolean | نجاح طلب الـAPI نفسه. **مختلف عن** `data.status`. |
| `message` | string | رسالة الـAPI. |
| `data.purchase_request_id` | integer | طلب الاحتياج المطلوب. |
| `data.status` | `1 \| 2 \| null` | حالة الاستلام الحالية: `1` جزئي، `2` كامل، و`null` إذا لم يبدأ الاستلام وفق الاتفاق السابق. |
| `data.items_summary` | array | ملخص **كل الأصناف** والكميات المطلوبة والمستلمة والمتبقية. |
| `data.items_summary[].purchase_request_item` | object | تفاصيل الصنف الأصلي، بما فيها المرحلة والنوع واسم الصنف. |
| `data.items_summary[].requested_quantity` | decimal string | الكمية المطلوبة. |
| `data.items_summary[].received_quantity` | decimal string | مجموع الكميات المستلمة من كل الدفعات. |
| `data.items_summary[].remaining_quantity` | decimal string | الكمية المتبقية للاستلام. |
| `data.receipts` | array | جميع دفعات الاستلام في الاستجابة المقدمة. |
| `data.receipts[].id` | integer | رقم دفعة الاستلام. |
| `data.receipts[].employee` | object | الموظف المسؤول عن الاستلام. |
| `data.receipts[].organization_employee` | object | الموظف الذي سجّل العملية في النظام. |
| `data.receipts[].status` | `1 \| 2` | حالة الاستلام التاريخية **بعد هذه الدفعة**. |
| `data.receipts[].date` | string | تاريخ الاستلام `YYYY-MM-DD`. |
| `data.receipts[].items` | array | الأصناف التي استُلمت **في هذه الدفعة**. |
| `data.receipts[].items[].purchase_request_item_id` | integer | مرجع الصنف الأصلي. |
| `data.receipts[].items[].quantity` | decimal string | كمية هذا الصنف في هذه الدفعة فقط. |
| `data.receipts[].created_at` | string | وقت تسجيل العملية كما أعاده الـBackend. |

> **مهم:** `data.status` هو **receiving status**، بينما `status` في جذر الـResponse هو **API success boolean**.

### Understanding the provided data

| Purchase request item | Type | Requested | Receipt #1 | Receipt #2 | Receipt #3 | Total received | Remaining |
|---|---|---:|---:|---:|---:|---:|---:|
| `9` — run | material | 10.00 | 8.00 | 1.00 | 1.00 | 10.00 | 0.00 |
| `10` — zzzzzzz | product | 5.00 | 3.00 | 2.00 | — | 5.00 | 0.00 |

- `Receipt #1`: `PARTIAL (1)`.
- `Receipt #2`: `PARTIAL (1)`.
- `Receipt #3`: `COMPLETE (2)`؛ اكتملت عنده كمية الصنف `9`، وكان الصنف `10` مكتملًا بالفعل من الدفعة الثانية.
- `data.status = 2` لأن كل الأصناف أصبحت كمياتها المتبقية `0.00`.

---

## 4. Suggested frontend flow

1. عند فتح شاشة الاستلام، استدعِ `fetch_purchase_request_receipts` باستخدام `purchase_request_id`.
2. اعرض كل الأصناف من `data.items_summary` باستخدام `purchase_request_item.itemable.title` و`itemable_type` وبيانات المرحلة عند الحاجة.
3. اعرض لكل صنف `requested_quantity` و`received_quantity` و`remaining_quantity`.
4. اسمح بإدخال **كمية الدفعة الحالية فقط** للأصناف التي `remaining_quantity > 0`.
5. الأصناف ذات الكمية المدخلة `0` أو الفارغة **لا تُرسل ضمن `items`**؛ أرسل فقط الأصناف التي لها كمية موجبة، وفق الـValidation المتفق عليه.
6. امنع إرسال الطلب إذا لم يُدخل المستخدم أي كمية موجبة.
7. تحقق على الفرونت أن الكمية المدخلة لا تتجاوز المتبقي، **مع الاعتماد على الـBackend كمرجع نهائي** (لأن الاستلام قد يتغير بالتزامن).
8. أرسل الطلب إلى `store_purchase_request_receipt` مع `date` و`employee_id` الاختياري.
9. بعد نجاح الـStore، أعد استدعاء الـFetch لتحديث الكميات وسجل الدفعات وحالة الاستلام.
10. إذا كانت `data.status === 2`، عطّل إضافة دفعة استلام جديدة وأظهر أن الطلب مكتمل الاستلام.
11. اعرض تاريخ الاستلام من `receipts` بدون تعديل الدفعات القديمة؛ **لا يوجد Edit/Delete ضمن الـEndpoints المحددة**.

### Example: build `items` from form inputs

```ts
const items = formItems
  .filter((item) => item.quantity !== '' && Number(item.quantity) > 0)
  .map((item) => ({
    purchase_request_item_id: item.purchase_request_item_id,
    quantity: item.quantity,
  }))

// Important: keep decimal precision appropriate for the API and
// validate at most 2 fractional digits before submitting.
```

### UI status mapping

```ts
type ReceivingStatus = 1 | 2 | null

function receivingStatusLabel(status: ReceivingStatus): string {
  switch (status) {
    case 1:
      return 'استلام جزئي'
    case 2:
      return 'استلام كامل'
    default:
      return 'لم يبدأ الاستلام'
  }
}
```

---

## 5. Key frontend notes

- **لا تستخدم** `itemable.id` بدل `purchase_request_item.id` عند تكوين `purchase_request_item_id`؛ المثال المعطى: `purchase_request_item.id = 9` بينما `itemable.id = 5`.
- استخدم قيم الكميات القادمة من الـAPI كـ**decimal strings**، ولا تفترض أنها integers.
- `items_summary` يمثل التراكم الكلي، بينما `receipts[].items` يمثل تفاصيل دفعة محددة.
- لا تغيّر حالة أي دفعة قديمة بناءً على حالة الطلب الحالية.
- لا تفترض استجابة معينة للـStore أو شكل أخطاء الـValidation لم تُرسل عينات فعلية لهما؛ اعتمد على كود الـBackend أو Postman عند التكامل.
- الطلب النموذجي المقدم وفيه `quantity: 0` يحتاج تأكيدًا من الـBackend إذا كان سلوك التنفيذ الحالي يسمح به؛ **قواعد العمل المعتمدة سابقًا تقتضي رفض الصفر، لذلك الواجهة تُرسِل الأصناف ذات الكمية الموجبة فقط**.
