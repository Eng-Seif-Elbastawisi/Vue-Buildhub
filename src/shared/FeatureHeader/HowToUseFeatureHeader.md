## Overview

# The Feature Header component is a reusable layout element that displays:

- A background/header image
- A dynamic page title
- A breadcrumb navigation
- Optional action buttons via slot

- It is typically used at the top of pages to provide context and navigation.

## How To use

```vue
<FeatureHeader>
  <template #actions>
    <button class="btn btn-primary">Add</button>
  </template>
</FeatureHeader>
```
