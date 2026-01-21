# Knight Validation by Coderitter

## Install

`npm install knight-validation`

## Overview

### Constraints for single properties

Add constraints to single properties.

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

You can also use any constraint on multiple properties at once.

```typescript
import { Required, Validator } from 'knight-validation'

class UserValidator extends Validator {
  constructor() {
    super()

    this.add(['fistName', 'lastName', 'email'], new Required)
  }
}
```

The given constraint is being applied to every given property. If one property is not fitting the constraint, the whole constraint will be regarded as not fulfilled.

Every constraint offers a set of parameters with which you can fine tune its behavior.

```typescript
import { Required, Validator } from 'knight-validation'

class UserValidator extends Validator {
  constructor() {
    super()

    // Exactly one property must be there
    this.add(['fistName', 'lastName', 'email'], new Required({ exactFits: 1 }))

    // At least two properties must be there
    this.add(['fistName', 'lastName', 'email'], new Required({ minFits: 2 }))

    // At most two properties must be there
    this.add(['fistName', 'lastName', 'email'], new Required({ maxFits: 2 }))
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
new Bounds({ greaterThanEqual: 0, lesserThanEqual: 10 })

// Check a property's value equals one of the three given strings
new Enum('Moni', 'Lisa', 'Anna')
// Check if a property's value equals one of the three given numbers
new Enum(1, 3, 7)

new Exists(async (user: User) => {
  // The user object is the object which is currently validated
  // Return true if your exists condition is met
})

// Check if the length of a string or array has a minmum and/or maximum length
new Length({ min: 5, max: 10})
// Check if the length of a string or array has exactly a specific length
new Length({ exact: 5 })

// Check that a property is not undefined
new Required

// Check if a property's value is one of the given JavaScript type
new TypeOf('number', null)
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

A misfit contains the following information.

```typescript
// The name of the constraint that resulted in the misfit
misfit.constraint == 'Required'

// The involved properties
misfit.property == [ 'email' ]

// Contextual values specific to the misfit at hand (Optional)
misfit.values

// A misfit message (Optional)
misfit.message == 'The property email is required.'
```

The optional `message` needs to be provided by your application, it is not part of this package.

Every misfit has a `values` property which holds an object containing contextual information specific to the constraint that created the misfit. Every misfit that is provided in this package, extends the interface `ConstraintMisfitValues` to define the appearance of the `values` object. 

```typescript
interface ConstraintMisfitValues {
  minFits?: number
  maxFits?: number
  exactFits?: number
  misfits?: Misfit[]
}
```

Its properties come into play if the misfit was applied to multiple properties. The `misfits` property references an array of misfits that were found when the constraint was checked on each property individually.

#### Check only what is there

You can validate only what is there. This means, every constraint is only applied when the value of a property is not `undefined`. This is useful if you want to work with partial objects for updating purposes.

```typescript
let user = new User
user.email = undefined

let misfits = validator.validate(user, { checkOnlyWhatIsThere: true })

misfits.length == 0 // There are no misfits even though the email property is required
```

### Constraints that are only checked if a condition is met

You can provide a condition which is evaluated before the constraint is being checked. If the condition is not met, the constraint will not be checked.

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

In the case the misfit involves exactly one property, its corresponding validation function receives the value of that one property as a parameter. In the case the misfit involves more than one property, the corresponding validation function receives the whole object that is being validated plus the properties that are to be involved in the check. That way, the individual properties can be accessed and involved in the check.

### Custom constraints as classes

If you want to reuse a constraint over and over again, create a new class for it.

```typescript
import { Constraint, ConstraintMisfitValues } from 'knight-validation'

// You need to extend from the default ConstraintMisfitValues since it provides 
// the properties being used when the constraint is being applied to multiple properties
export interface OnlyGermanMailsMisfitValues extends ConstraintMisfitValues {
  actualTld?: string
}

export class OnlyGermanMailsConstraint extends Constraint<string, OnlyGermanMailsMisfitValues> {

validate(email: string): Promise<Misfit<OnlyGermanMailsMisfitValues>|null> {
    if (! email.endsWith('.de')) {
      let misfit = new Misfit<OnlyGermanMailsMisfitValues>
      
      misfit.values = {
        actualTld: email.split('.').slice(-1)[0]
      }

      // You do not need to set the constraint name nor the property on the misfit.
      // Those will be set automatically.

      return new Misfit
    }
  }
}
```

If you want to define specific behavior for the case that the constraint is being used to validate multiple properties instead of only one, then overwrite the method `validateMultipleProperties`.

```typescript
import { Constraint } from 'knight-validation'

// You do not need to extend the default ConstraintMisfitValues since we are overriding the 
// method that defines the behavior when the misfit is being used on multiple properties
export interface DifferentMisfitValues {
  firstName: string
  lastName: string
}

export class Different extends Constraint<User, DifferentMisfitValues> {

  validateMultipleProperties(object: any, properties: string[]): Promise<Misfit<DifferentMisfitValues>|null> {
  if (user.firstName == user.lastName) {
    let misfit = new Misfit<DifferentMisfitValues>

    misfit.values = {
      firstName: user.firstName,
      lastName: user.lastName
    }

    // You do not need to set the constraint name nor the properties on the misfit.
    // Those will be set automatically.
    
    return misfit
  }
}
```

In the `Constraint` super class, the method `validateMultipleProperties` is being implemented with a useful default behavior. It iterates through every property and uses the `validate` method to check each property individually, while also offering the parameters `exactFits`, `minFits` and `maxFits` to adjust its behavior.