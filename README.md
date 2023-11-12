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
    
    this.add(['firstName', 'lastName'], 'Different', async (user: User) => {
      if (user.firstName == user.lastName) {
        // You do not need to set the constraint name nor the properties on the misfit.
        // Those will be set automatically.
        return new Misfit
      }
    })
  }
}
```

### Available constraints

```typescript
// Check if a property is absent
new Absent

// Check if a number is greater and/or lesser than a given number
new Bounds({ greaterThan: 0, lesserThan: 10 })
// Check if a number is greater and/or lesser than or equal a given number
new Bounds({ greaterThanEqual: 0, lesserThanqEqual: 10 })

// Check a property's value equals one of the three given strings
new Enum('Moni', 'Lisa', 'Anna')
// Check if a property's value equals one of the three given numbers
new Enum(1, 3, 7)

new Exists(async (user: User) => {
  // The user object is the object which is currently validated
  // Return true if your exists condition is met
})

// Check if the length of a string has a minmum and/or maximum length
new Length({ min: 5, max: 10})
// Check if the length of a string has exactly a specific length
new Length({ exact: 5 })

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
// The name of the constraint that resulted in the misfit
misfit.constraint == 'Required'

// The involved properties
misfit.property == [ 'email' ]

// Contextual values specific to the misfit at hand (Optional)
misfit.values

// A misfit message (Optional)
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

### Anonymous custom constraints

You can create custom constraints on the fly without having to create a dedicated constraint class. 

```typescript
let validator = new Validator

// Second parameter is the name of the contstraint
// Third parameter is the validation function which receives the value of the property
validator.add('email', 'OnlyGermanMails', async (email: string) {
  if (! email.endsWith('.de')) {

    // You do not need to set the constraint name nor the property on the misfit.
    // Those will be set automatically.
    return new Misfit
  }
})

// Second parameter is the name of the contstraint
// Third parameter is the validation function which receives the complete object owning both properties
validator.add(['firstName', 'lastName'], 'Different', async (user: User) => {
  if (user.firstName == user.lastName) {
    let misfit = new Misfit

    // You do not need to set the constraint name nor the properties on the misfit.
    // Those will be set automatically.
    
    // You can provide some contextual information
    misfit.values = {
      firstName: user.firstName,
      lastName: user.lastName
    }

    return misfit
  }
})
```

In the case the misfit involves exactly one property, its corresponding validation function receives the value of that one property as a parameter. In the case the misfit involves more than one property, the corresponding validation function receives the whole object that is being validated, so that all of the involved properties can be accessed.

### Custom constraints as classes

If you want to reuse a constraint over and over again, create a new class for it.

```typescript
import { Constraint } from 'knight-validation'

export interface DifferentMisfitValues {
  firstName: string
  lastName: string
}

export class Different extends Constraint<User, DifferentMisfitValues> {

  // Override the abstract method validate
  validate(user: User): Promise<Misfit<DifferentMisfitValues>|null> {
  if (user.firstName == user.lastName) {
    let misfit = new Misfit<DifferentMisfitValues>

    // You do not need to set the constraint name nor the properties on the misfit.
    // Those will be set automatically.
    
    misfit.values = {
      firstName: user.firstName,
      lastName: user.lastName
    }

    return misfit
  }
}
```

You need to pay attention to the parameter of the validate method. In the case your constraint is assigned to a single property, that parameter will have the value of the mentioned property. In the case your constraint is assigned to an array of properties, that parameter will have the complete object as its value which ought to contain the mentioned properties.