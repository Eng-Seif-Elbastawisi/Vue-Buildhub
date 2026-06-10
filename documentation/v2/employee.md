## Add Employee

```json
{
  "first_name": "first name",
  "second_name": "second name",
  "email": "email@gmail.com",
  "employee_ref": "E-120",
  "phone": "01007599123",
  "gender": 1, // 1 => male  2 => female
  "image": "image",
  "status": 1 //1 => active   // 2 => disactive
}
```

## Edit Employee

```json
{
  "employee_id": 1,
  "first_name": "first name",
  "second_name": "second name",
  "email": "email@gmail.com",
  "employee_ref": "E-120",
  "phone": "01007599123",
  "gender": 1, // 1 => male  2 => female
  "image": "image",
  "status": 1 //1 => active   // 2 => disactive
}
```

## delete Employee

```json
{
  "employee_id": 1
}
```

## Show Employee

```json
{
  "employee_id": 1
}
```

## Response Show Employee

```json
{
  "data": {
    "id": 1,
    "first_name": "Mohab",
    "last_name": "Mohamed",
    "email": "mohab@gmail.com",
    "phone": "01007599123",
    "status": "active",
    "image": "image",
    "employee_ref": "E-108"
  }
}
```

## Index Employee

```json
{
  "word": "",
  "with_pagination": 1,
  "page": 1,
  "per_page": 10,
  "status"?: 1 //1 => active   // 2 => disactive
}
```

## Response Index Employee

```json
{
  "data": [
    {
      "id": 1,
      "first_name": "Mohab",
      "last_name": "Mohamed",
      "email": "mohab@gmail.com",
      "phone": "01007599123",
      "status": "active",
      "image": "image",
      "employee_ref": "E-108"
    }
  ]
}
```
