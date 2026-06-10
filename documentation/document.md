# Document

## Document Type

```json enumr
[
    "id": 1,
    "title": "Document Type 1",
    "id": 2,
    "title": "Document Type 2",
    "id": 3,
    "title": "Document Type 3",
]
```

## Add Document

```json
{
    "title": string,
    "description":string,
    "ref_number":number,
    "tag":string,
    "image":string[],
    "files":string[],
    "document_type_id": number,
}
```

## Edit Document

```json
{
    "document_id": number,
    "title": string,
    "description":string,
    "ref_number":number,
    "tag":string,
    "image":string[],
    "files":string[],
    "document_type_id": number,
}
```

## Delete Document

```json
{
    "document_id": number
}
```

## Show Document

```json
{
    "document_id": number
}
```

## Documents Index

```json
{
    "word": string,
    "pageNumber": number,
    "perPage": number,
    "withPage": number
}
```
