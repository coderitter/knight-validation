# Mega Nice Validation

## Install

`npm install mega-nice-validation`

## Overview

### Mismatch

```typescript
class Mismatch {

  field: string
  code: string
  message: string
...
```

### Instances

```typescript
Mismatch.missing()
Mismatch.notFound()
```