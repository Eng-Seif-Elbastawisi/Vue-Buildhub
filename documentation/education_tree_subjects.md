# Education Tree Subjects

## fetch Education Classification subjects branches

```json
{
    "education_classification_id"?: number,
    "branch_id"?: number,

}
```

## Response Education Classification subjects branches

```json
{
    "subjects_branches": [
        {
            "branch_id": number,
            "branch_title": string,
            "branchs": [
                {
                    "branch_id": number,
                    "branch_title": string,
                    "branchs":[]
                }
            ]
        }
    ]
}
```

## add Education Classification subjects branch

```json
{
  "branch_title": string,
  "branch_id"?:number,
  "education_classification_id"?:number,
}
```
