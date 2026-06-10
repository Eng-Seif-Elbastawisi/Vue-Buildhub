# Employee

## Add Employee

```json
{
    "name": string,
    "email": string,
    "phone": string,
    "password": string,
    "image": string,
    "isSuperadmin": boolean,
    "role_id": number,
    "employeeType": number
}
```

## Edit Employee

```json
{
    "employee_id": number,
    "name": string,
    "email": string,
    "phone": string,
    "password": string,
    "image": string,
    "isSuperadmin": boolean,
    "role_id": number,
    "employeeType": number
}
```

## Delete Employee

```json
{
    "employee_id": number
}
```

## Show Employee

```json
{
    "employee_id": number
}
```

## Employees Index

```json
{
    "word": string,
    "pageNumber": number,
    "perPage": number,
    "withPage": number
}
```
