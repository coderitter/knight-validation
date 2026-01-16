import { Log } from 'knight-log'
import { Misfit } from 'knight-misfit'
import { Constraint } from './Constraint'
import { DotNotation } from './DotNotation'
import { QuickConstraint } from './constraints/QuickConstraint'

let log = new Log('knight-validation/Validator.ts')

export interface ValidatorOptions {
  checkOnlyWhatIsThere?: boolean
  exclude?: string[]
}

interface ValidatorEntry<T = any> {
  properties: string[]
  constraint?: Constraint
  validator?: Validator
  condition?: (object: T) => Promise<boolean>
}

export class Validator<T = any> {

  options?: ValidatorOptions
  entries: ValidatorEntry<T>[] = []

  constructor(options?: ValidatorOptions) {
    this.options = options
  }

  add(constraint: Constraint, condition?: (object: T) => Promise<boolean>): void
  add(constraintName: string, validate: (value: any) => Promise<Misfit|null>, condition?: (object: T) => Promise<boolean>): void
  add(property: string, constraint: Constraint, condition?: (object: T) => Promise<boolean>): void
  add(property: string, constraintName: string, validate: (value: any) => Promise<Misfit|null>, condition?: (object: T) => Promise<boolean>): void
  add(properties: string[], constraint: Constraint, condition?: (object: T) => Promise<boolean>): void
  add(properties: string[], constraintName: string, validate: (object: T, properties: string[]) => Promise<Misfit|null>, condition?: (object: T) => Promise<boolean>): void
  add(property: string, validator: Validator<any>, condition?: (object: T) => Promise<boolean>): void
  add(validator: Validator): void

  add(...args: any[]): void {
    let l = log.mt('add')
    l.param('args', args)

    if (args[0] instanceof Validator) {
      let validator = args[0]

      for (let propertyConstraint of validator.entries) {
        this.entries.push(propertyConstraint)
      }
    }
    else if (args[0] instanceof Constraint) {
      this.entries.push({
        properties: [],
        constraint: args[0],
        condition: args.length > 1 ? args[1] : undefined
      })
    }
    else if (typeof args[0] == 'string' && typeof args[1] == 'function') {
      this.entries.push({
        properties: [],
        constraint: new QuickConstraint(args[0], args[1]),
        condition: args.length > 2 ? args[2] : undefined
      })
    }
    else if (typeof args[0] == 'string' || Array.isArray(args[0])) {
      let properties = typeof args[0] == 'string' ? [ args[0] ] : args[0] as string[]
      let constraint: Constraint|undefined = undefined
      let validator: Validator<any>|undefined = undefined
      let condition

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
      else if (args[1] instanceof Validator) {
        validator = args[1]
        condition = args.length > 2 ? args[2] : undefined
      }
      else {
        throw new Error('Invalid parameters')
      }

      l.dev('properties', properties)
      l.dev('constraint', constraint)
      l.dev('validator', validator)
      l.dev('condition', condition)

      if (properties.length == 1 && this.options?.exclude) {
        for (let property of this.options?.exclude) {
          if (property == properties[0]) {
            l.dev('Not adding constraint since the property was excluded')
            l.returning()
            return
          }
        }
      }

      this.entries.push({
        properties: properties,
        constraint: constraint,
        validator: validator,
        condition: condition
      })

      l.dev('Constraint was added')
      l.returning()
    }
  }

  async validate(object: T, options?: ValidatorOptions): Promise<Misfit[]> {
    let l = log.mt('validate')
    l.param('object', object)
    l.param('options', options)

    options = options || this.options
    let misfits: Misfit[] = []
    let misfittingProperties: (string|null)[] = []

    for (let entry of this.entries) {
      let constraintOrValidatorName = entry.constraint ? entry.constraint?.name : entry.validator ? entry.validator.constructor.name : ''
      l.location = ['' + JSON.stringify(entry.properties) + ' > ' + constraintOrValidatorName]
      
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
          l.called('entry.constraint.validate')
        }
        else if (entry.properties.length == 1) {
          l.dev('Constraint is to be applied to one property')
          let property = entry.properties[0]
          let dotNotation = new DotNotation(property)
          let value = dotNotation.get(object)
          l.calling('entry.constraint.validate', value)
          misfit = await entry.constraint.validate(value)
          l.called('entry.constraint.validate')
        }
        else {
          l.dev('Constraint is to be applied tu multiple properties')
          l.calling('entry.constraint.validateMultipleProperties', object)
          misfit = await entry.constraint.validateMultipleProperties(object, entry.properties)
          l.called('entry.constraint.validateMultipleProperties')
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

        if (value instanceof Array) {
          l.dev('Value of the property is an array. Iterating its elements...')
          for (let i = 0; i < value.length; i++) {
            if (typeof value[i] != 'object' || value[i] === null) {
              l.dev('Array element is not of type object or null. Skipping...', value[i])
              continue
            }

            l.calling('entry.validator.validate', value[i], options)
            let subMisfits = await entry.validator.validate(value[i], options)
            l.called('entry.validator.validate')

            if (subMisfits.length > 0) {
              l.dev('Validator returned misfits', subMisfits)
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
          l.dev('Value of the property is not an array')

          l.calling('entry.validator.validate', value, options)
          let subMisfits = await entry.validator.validate(value, options)
          l.called('entry.validator.validate')

          if (subMisfits.length > 0) {
            l.dev('Validator returned misfits', subMisfits)
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

    l.returning('Returning misfits', misfits)
    return misfits
  }
}
