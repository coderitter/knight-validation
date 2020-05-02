# Mega Nice Validation

## Install

`npm install mega-nice-validation`

## Overview

### Constraints for single fields

```typescript
import { Required, TypeOf, Unique, Validator } from 'mega-nice-validation'

class UserValidator extends Validator {
  constructor(userDb: UserDb) {
    super()

    this.add('email', new Required)
    this.add('email', new TypeOf('string'))
    this.add('email', new Unique(async (user: User) => {
      let count = await userDb.countByEmail(user.email)
      return count == 0
    }))
  }
}
```

### Constraints for multiple fields

```typescript
import { Required, TypeOf, Unique, Validator } from 'mega-nice-validation'

class UserValidator extends Validator {
  constructor(userDb: UserDb) {
    super()
    this.add(['firstName', 'lastName'], ...)
  }
}
```

### Available constraints

```typescript
new Absent // Check if a field is absent

new Enum('Moni', 'Lisa', 'Anna') // Check a field's value equals one of the three given strings
new Enum(1, 3, 7) // Check if a field's value equals one of the three given numbers

new Exists(async (user: User) => { // The user object is the object which is currently validated
  // Return true if your exists condition is met
})

new Required // Check if a field is there

new TypeOf('number') // Check if a field's value is of the given JavaScript type
new TypeOf(Date) // Check if a field's value is an instance if the given class

new Unique(async (user: User) => { // The user object is the object which is currently validated
  // Return true if your exists condition is met
})
```

### Validation

Validating an object returns an array of misfits which is empty if there are not any. The validator goes through all constraints for one field and stops the validation on the first misfit. Afterwards it goes on to the next field.

```typescript
let user = new User
user.email = undefined

let validator = new UserValidator
let misfits = validator.validate(user)

misfits.length == 1
```

A misfit contains the following informations by default.

```typescript
misfit.name == 'Required' // The name of the misfit which defaults to the name of the constraint which was not met
misfit.field == 'email' // The field where the misfit occured
misfit.fields == ['firstName', 'lastName'] // If the constraint was for multiple fields then there is an array of those fields and the field property is empty
misfit.constraints // It contains any information that is useful about why checking the constraint resulted in a misfit. (Optional)
misift.message == 'The field email is required.' // A message. (Optional)
```

#### Check only what is there

You can validate only what is there. This means any constraint becomes optional.

```typescript
let user = new User
user.email = undefined

let misfits = validator.validate(user, { checkOnlyWhatIsThere: true })

misfits.length == 0 // There are no misfits even though the email field is required
```

#### Include rules

```typescript
// Include all constraints regarding the email field. Exlude all other fields.
let misfits = validator.validate(user, { include: ['email'] })
// Include only the required constraint of the email field. Exclude all other constraints of the email field, but include all other fields.
let misfits = validator.validate(user, { include: [{ field: 'email', constraint: 'Required' }] })
```

#### Exclude rules

```typescript
// Exclude all constraints regarding the email field
let misfits = validator.validate(user, { exclude: ['email'] })
// Exclude only the required constraint of the email field
let misfits = validator.validate(user, { exclude: [{ field: 'email', constraint: 'Required' }] })
```

### Anonymous custom constraints

You can add constraints on the fly without creating a class.

```typescript
let validator = new Validator

validator.add(['firstName', 'lastName'], 'Different', async (user: User) => {
  if (user.firstName == user.lastName) {
    let misfit = new Misfit

    // You can skip setting a name and the field(s) for the misfit. These will be set automatically.
    
    // We give it some information here on what went wrong. What you put in here depends on your needs.
    misfit.constraints = {
      firstName: user.firstName,
      lastName: user.lastName
    }

    return misfits
  }
})
```

### Custom constraints as classes

If you want to reuse a constraint over and over again, create a new class for it.

```typescript
import { Constraint } from 'mega-nice-validation'

class YourConstraint extends Constraint {

  // Override the abstract method validate
  async validate(obj: any, field: string|string[]): Promise<Misfit|undefined> {

    // At first you want to check if the field is absent because in case of absense you do not want to validate because a field may be optional.
    if (this.isFieldAbsent(obj, field)) {
      return
    }

    // Next you need to check if the field was a single or a combined one. Maybe you just implement on of the two possibilities.
    if (typeof field == 'string') {
      // In case of a single field
    }
    else {
      // In case of multiple fields
    }
  }
}
```

Another possibility is to use the `defaultValidation` method. It will do the check for absence and will implement the validation of combined fields.

```typescript
import { Constraint } from 'mega-nice-validation'

class YourConstraint extends Constraint {
  async validate(obj: any, field: string|string[]): Promise<Misfit|undefined> {
    return this.defaultValidation(obj, field, async (value: any) => {
      if (value == 1) {  // Validate the value here
        return new Misfit
      }
    })
  }
}
```

### Constraints that are only checked if there is a condition met

```typescript
import { Required, Validator } from 'mega-nice-validation'

class UserValidator extends Validator {
  constructor(userDb: UserDb) {
    super()

    // lastName is only required if the firstName exists
    this.add('lastName', new Required, async (user: User) => new Required().validateValue(user.firstName))
  }
}
```
