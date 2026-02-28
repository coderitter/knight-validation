import { Log } from 'knight-log'
import { Misfit } from 'knight-misfit'
import { Constraint } from './Constraint'
import { DotNotation } from './DotNotation'
import { QuickConstraint } from './constraints/QuickConstraint'

let log = new Log('knight-validation/Validator.ts')

export interface ValidatorMap {
  [validatorId: string]: Validator
}

export interface ValidatorOptions {
  checkOnlyWhatIsThere?: boolean
  exclude?: string[]
}

export interface ValidatorEntry<T = any> {
  properties: string[]
  constraint?: Constraint
  validator?: Validator
  condition?: (object: T) => Promise<boolean>
}

export class ValidatorFactory<T = any> {
  validatorId: string
  createFn: (validators: ValidatorMap, validatorId: string) => Validator<T>

  constructor(
    validatorId: string|(new (...args: any[]) => any), 
    createFn: (validators: ValidatorMap, validatorId: string) => Validator<T>
  ) {
    this.validatorId = typeof validatorId == 'string' ? validatorId : validatorId.name
    this.createFn = createFn
  }

  createOrGetExisting(validators: ValidatorMap): Validator<T> {
    let l = log.cls('ValidatorFactory', 'createOrGetExisting')
    l.param('validators', validators)
    l.creator('this.validatorId', this.validatorId)

    if (this.validatorId in validators) {
      l.returning('existing validator', validators[this.validatorId])
      return validators[this.validatorId]
    }

    l.returning('created validator')
    return this.createFn(validators, this.validatorId)
  }
}

export class Validator<T = any> {
  validatorId: string
  options?: ValidatorOptions
  validators: ValidatorMap
  entries: ValidatorEntry<T>[] = []

  constructor(options?: ValidatorOptions, validators?: ValidatorMap, validatorId?: string|(new (...args: any[]) => any)) {
    this.options = options
    this.validators = validators || {}

    if (typeof validatorId == 'string') {
      this.validatorId = validatorId
    }
    else if (typeof validatorId == 'function') {
      this.validatorId = validatorId.name
    }
    else {
      this.validatorId = this.constructor.name
    }

    this.validators[this.validatorId] = this
  }

  add(constraint: Constraint, condition?: (object: T) => Promise<boolean>): void
  add(constraintName: string, validate: (value: any) => Promise<Misfit|null>, condition?: (object: T) => Promise<boolean>): void
  add(validatorFactory: ValidatorFactory): void
  add(property: string, constraint: Constraint, condition?: (object: T) => Promise<boolean>): void
  add(property: string, constraintName: string, validate: (value: any) => Promise<Misfit|null>, condition?: (object: T) => Promise<boolean>): void
  add(property: string, validatorFactory: ValidatorFactory, condition?: (object: T) => Promise<boolean>): void
  add(properties: string[], constraint: Constraint, condition?: (object: T) => Promise<boolean>): void
  add(properties: string[], constraintName: string, validate: (object: T, properties: string[]) => Promise<Misfit|null>, condition?: (object: T) => Promise<boolean>): void
  add(validatorEntry: ValidatorEntry): void

  add(...args: any[]): void {
    let l = log.mt('add')
    l.location = [this.constructor.name]
    l.param('args', args)

    let properties: string[]|undefined
    let constraint: Constraint|undefined
    let validatorFactory: ValidatorFactory|undefined
    let condition: ((object: T) => Promise<boolean>)|undefined

    if (args[0] instanceof ValidatorFactory) {
      if (this.options == undefined) {
        this.options = {}
      } 

      let validator = args[0].createOrGetExisting(this.validators)

      if (validator == this) {
        throw new Error('Cannot add add another validator that is itself which would result in an endless loop of adding itself!')
      }

      if (
        typeof validator == 'object' && 
        validator !== null && 
        'entries' in validator && 
        Array.isArray(validator.entries) && 
        validator.entries.length > 0
      ) {
        l.dev('Adding entries from validator', validator)

        for (let entry of validator.entries) {
          this.add(entry)
        }
      }
      else {
        l.warn('Given validator to add does not have any entries!', validator)
      }
    }
    else if (typeof args[0] == 'object' && args[0] !== null && 'properties' in args[0] && Array.isArray(args[0].properties)) {
      properties = (args[0] as ValidatorEntry).properties
      constraint = (args[0] as ValidatorEntry).constraint
      condition = (args[0] as ValidatorEntry).condition

      if ((args[0] as ValidatorEntry).validator) {
        validatorFactory = new ValidatorFactory(
          (args[0] as ValidatorEntry).validator!.constructor.name,
          () => (args[0] as ValidatorEntry).validator!
        )
      }

      if (constraint != undefined && validatorFactory != undefined) {
        throw new Error('The provided parameter is a ValidatorEntry with both a constraint and a validator defined. This is invalid! Only one may be specified at a time!')
      }
    }
    else if (args[0] instanceof Constraint) {
      properties = []
      constraint = args[0],
      condition = args.length > 1 ? args[1] : undefined
    }
    else if (typeof args[0] == 'string' && typeof args[1] == 'function' && args[1].prototype?.constructor !== args[1] ) {
      properties = []
      constraint = new QuickConstraint(args[0], args[1])
      condition = args.length > 2 ? args[2] : undefined
    }
    else if (typeof args[0] == 'string' || Array.isArray(args[0])) {
      properties = typeof args[0] == 'string' ? [ args[0] ] : args[0] as string[]

      if (typeof args[1] == 'string') {
        if (typeof args[0] == 'string') {
          constraint = new QuickConstraint(args[1], <any> args[2], undefined)
        }
        else {
          constraint = new QuickConstraint(args[1], undefined, <any> args[2])
        }
        
        condition = args.length > 3 ? args[3] : undefined
      }
      else if (args[1] instanceof Constraint) {
        constraint = args[1]
        condition = args.length > 2 ? args[2] : undefined
      }
      else if (args[1] instanceof ValidatorFactory) {
        validatorFactory = args[1]
        condition = args.length > 2 ? args[2] : undefined
      }
    }

    if (properties == undefined) {
      l.returning()
      return
    }

    let propertyExcluded = false
    if (properties.length == 1 && this.options?.exclude) {
      for (let property of this.options?.exclude) {
        if (property == properties[0]) {
          propertyExcluded = true
          l.dev('Not adding constraint since the property was excluded', {
            properties: properties,
            constraint: constraint,
            validatorFactory: validatorFactory,
            condition: condition
          })
          break
        }
      }
    }

    if (!propertyExcluded) {
      let validator: Validator|undefined
      
      if (validatorFactory) {
        if (this.options == undefined) {
          this.options = {}
        } 

        validator = validatorFactory.createOrGetExisting(this.validators)

        if (validator == undefined) {
          throw new Error('Validator factory did not create a validator!')
        }
      }

      let entry: ValidatorEntry = {
        properties: properties,
        constraint: constraint,
        validator: validator,
        condition: condition
      }

      this.entries.push(entry)
      l.dev('Constraint was added', entry)        
    }

    l.returning()
  }

  async validate(object: T, options?: ValidatorOptions, validated?: WeakSet<any>): Promise<Misfit[]> {
    let l = log.mt('validate')
    l.location = [this.constructor.name]
    l.param('object', object)
    l.param('options', options)

    if (validated == undefined) {
      validated = new WeakSet<any>
    }

    validated.add(object)

    options = options || this.options
    let misfits: Misfit[] = []
    let misfittingProperties: (string|null)[] = []

    for (let entry of this.entries) {
      let constraintOrValidatorName = entry.constraint ? entry.constraint?.name : entry.validator ? entry.validator.constructor.name : ''

      l.location = [this.constructor.name]
      l.dev('Checking constraint', JSON.stringify(entry.properties), constraintOrValidatorName)
      l.location = [this.constructor.name, JSON.stringify(entry.properties), constraintOrValidatorName]
      
      let propertyAlreadyHasAMisfit = false
      for (let property of entry.properties) {
        if (misfittingProperties.indexOf(property) > -1) {
          propertyAlreadyHasAMisfit = true
          break
        }
      }

      if (entry.properties.length == 0 && misfittingProperties.indexOf(null) > -1) {
        propertyAlreadyHasAMisfit = true
      }

      if (propertyAlreadyHasAMisfit) {
        l.dev('Property already has misfit. Skipping...')
        continue
      }

      if (entry.condition && ! await entry.condition(object)) {
        l.dev('The given condition is not met. Skipping...')
        continue
      }

      let atLeastOnePropertyExists = false
      l.creator('Check if at least one property exists...')
      for (let property of entry.properties) {
        let dotNotation = new DotNotation(property)

        if (dotNotation.exists(object)) {
          l.creator('Property exists', property)
          atLeastOnePropertyExists = true
          break
        }

        l.creator('Property does not exist', property)
      }

      if (! atLeastOnePropertyExists && options && options.checkOnlyWhatIsThere && misfittingProperties.length > 0) {
        l.dev('Not one of the given properties exist but it should only be checked what is there. Skipping...')
        continue
      }

      if (entry.constraint != undefined) {
        l.dev('Property will be checked by a single constraint')
        let misfit

        if (entry.properties.length == 0) {
          l.dev('Constraint is to be applied to the whole object')
          l.calling('entry.constraint.validate', object)
          misfit = await entry.constraint.validate(object)
          l.called('entry.constraint.validate', misfit)
        }
        else if (entry.properties.length == 1) {
          l.dev('Constraint is to be applied to one property')
          let property = entry.properties[0]
          let dotNotation = new DotNotation(property)
          let value = dotNotation.get(object)
          l.calling('entry.constraint.validate', value)
          misfit = await entry.constraint.validate(value)
          l.called('entry.constraint.validate', misfit)
        }
        else {
          l.dev('Constraint is to be applied to multiple properties')
          l.calling('entry.constraint.validateMultipleProperties', object)
          misfit = await entry.constraint.validateMultipleProperties(object, entry.properties)
          l.called('entry.constraint.validateMultipleProperties', misfit)
        }

        if (misfit) {
          l.dev('Misfit was returned', misfit)
          if (misfit.constraint === undefined) {
            l.creator('Setting the constraint name on the misfit')
            misfit.constraint = entry.constraint.name
          }

          misfit.properties = entry.properties.slice()

          misfittingProperties.push(...entry.properties)
          if (entry.properties.length == 0) {
            misfittingProperties.push(null)
          }

          misfits.push(misfit)
        }
      }
      else if (entry.validator != undefined) {
        l.dev('Property will be checked by a validator')

        if (entry.properties.length != 1) {
          l.error('Cannot apply validator because multiple properties were given')
          throw new Error('Using a whole validator only works for one property')
        }

        let property = entry.properties[0]
        let dotNotation = new DotNotation(property)
        let value = dotNotation.get(object)

        if (typeof value != 'object' || value === null) {
          l.dev('Value of the property is not of type object or null. Skipping...', value)
          continue
        }

        if (validated.has(value)) {
          l.dev('Object is or was already being validated. Skipping...', value)
          continue
        }

        if (value instanceof Array) {
          l.dev('Value of the property is an array. Iterating its elements...')
          for (let i = 0; i < value.length; i++) {
            if (typeof value[i] != 'object' || value[i] === null) {
              l.dev('Array element is not of type object or null. Skipping...', value[i])
              continue
            }

            l.calling('entry.validator.validate', value[i], options)
            let subMisfits = await entry.validator.validate(value[i], options, validated)
            l.called('entry.validator.validate', subMisfits)

            if (subMisfits.length > 0) {
              l.creator('Adding prefix to misfit properties...', `${property}[${i}].`)
              for (let misfit of subMisfits) {
                if (misfit.properties.length == 0) {
                  misfit.properties.push(`${property}[${i}]`)
                }
                else {
                  misfit.addPrefix(`${property}[${i}].`)
                }
              }

              misfittingProperties.push(...entry.properties)
              misfits.push(...subMisfits)
            }
          }
        }
        else {
          l.dev('Value of the property is a single object')

          l.calling('entry.validator.validate', value, options)
          let subMisfits = await entry.validator.validate(value, options, validated)
          l.called('entry.validator.validate', subMisfits)

          if (subMisfits.length > 0) {
            l.creator('Adding prefix to misfit properties...', property + '.')
            for (let misfit of subMisfits) {
                if (misfit.properties.length == 0) {
                  misfit.properties.push(property)
                }
                else {
                  misfit.addPrefix(property + '.')
                }
            }

            misfittingProperties.push(...entry.properties)
            misfits.push(...subMisfits)
          }
        }
      }
    }

    l.location = [this.constructor.name]
    l.returning('misfits', misfits)
    return misfits
  }
}
