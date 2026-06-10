# Education Tree Configuration

## fetch Education Classification configuration branchs

```json
{
    "education_classification_id"?: number,
    "branch_id"?: number,

}
```

## Response Education Classification configuration branchs

```json
{
    "configuration_branches": [
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

## add Education Classification configuration branch

```json
{
  "branch_id"?:number,
  "branch_title": string,
  "education_classification_id"?:number
}
```
