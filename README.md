# Knight Validation by Coderitter

## Install

`npm install knight-validation`

## Overview

### Constraints for single properties

```typescript
import { Required, TypeOf, Unique, Validator } from 'knight-validation'

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

### Constraints for multiple properties

```typescript
import { Validator } from 'knight-validation'

class UserValidator extends Validator {
  constructor(userDb: UserDb) {
    super()
    this.add(['firstName', 'lastName'], ...)
  }
}
```

### Available constraints

```typescript
// Check if a property is absent
new Absent

// Check a property's value equals one of the three given strings
new Enum('Moni', 'Lisa', 'Anna')
// Check if a property's value equals one of the three given numbers
new Enum(1, 3, 7)

new Exists(async (user: User) => {
  // The user object is the object which is currently validated
  // Return true if your exists condition is met
})

// Check if a property is there
new Required

// Check if a property's value is of the given JavaScript type
new TypeOf('number')
// Check if a property's value is an instance if the given class
new TypeOf(Date)

new Unique(async (user: User) => {
  // The user object is the object which is currently validated
  // Return true if your exists condition is met
})
```

### Validation

Validating an object returns an array of misfits which is empty if there are not any. The validator goes through all constraints for one property and stops the validation on the first misfit. Afterwards it goes on to the next property.

```typescript
let user = new User
user.email = undefined

let validator = new UserValidator
let misfits = validator.validate(user)

misfits.length == 1
```

A misfit contains the following informations by default.

```typescript
// The name of the misfit which defaults to the name of the constraint which was not met
misfit.constraint == 'Required'

// The property where the misfit occured
misfit.property == 'email'

// The properties where the misfit occured
misfit.properties == ['firstName', 'lastName']

// It contains any information that is useful about why checking the constraint resulted in a misfit (Optional)
misfit.value

// A message (Optional)
misift.message == 'The property email is required.'
```

#### Check only what is there

You can validate only what is there. This means any constraint becomes optional.

```typescript
let user = new User
user.email = undefined

let misfits = validator.validate(user, { checkOnlyWhatIsThere: true })

misfits.length == 0 // There are no misfits even though the email property is required
```

### Constraints that are only checked if a condition is met

```typescript
import { Required, Validator } from 'knight-validation'

class UserValidator extends Validator {
  constructor(userDb: UserDb) {
    super()

    // lastName is only required if the firstName exists
    this.add('lastName', new Required, async (user: User) => new Required().validateValue(user.firstName))
  }
}
```

#### Exclude rules

```typescript
// Exclude all constraints regarding the email property
let misfits = validator.validate(user, { exclude: ['email'] })

// Exclude only the required constraint of the email property
let misfits = validator.validate(user, { exclude: [{ property: 'email', constraint: 'Required' }] })
```

### Anonymous custom constraints

You can add constraints on the fly without creating a class.

```typescript
let validator = new Validator

validator.add(['firstName', 'lastName'], 'Different', async (user: User) => {
  if (user.firstName == user.lastName) {
    let misfit = new Misfit

    // You can skip setting a name and the property(s) for the misfit. These will be set automatically.
    
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
import { Constraint } from 'knight-validation'

class YourConstraint extends Constraint {

  // Override the abstract method validate
  async validate(obj: any, property: string|string[]): Promise<Misfit|undefined> {

    // At first you want to check if the property is absent because in case of absense you do not want to validate because a property may be optional.
    if (this.isPropertyAbsent(obj, property)) {
      return
    }

    // Next you need to check if the property was a single or a combined one. Maybe you just implement on of the two possibilities.
    if (typeof property == 'string') {
      // In case of a single property
    }
    else {
      // In case of multiple properties
    }
  }
}
```

Another possibility is to use the `defaultValidation` method. It will do the check for absence and will implement the validation of combined properties.

```typescript
import { Constraint } from 'knight-validation'

class YourConstraint extends Constraint {
  async validate(obj: any, property: string|string[]): Promise<Misfit|undefined> {
    return this.defaultValidation(obj, property, async (value: any) => {
      if (value == 1) {  // Validate the value here
        return new Misfit
      }
    })
  }
}
```
