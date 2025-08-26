import { Misfit } from 'knight-misfit'
import { Constraint } from './Constraint'
import { DotNotation } from './DotNotation'
import { QuickConstraint } from './constraints/QuickConstraint'

export interface ValidatorOptions {
  checkOnlyWhatIsThere?: boolean
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
  add(validator: Validator<T>): void

  add(...args: any[]): void {
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

      this.entries.push({
        properties: properties,
        constraint: constraint,
        validator: validator,
        condition: condition
      })
    }
  }

  async validate(object: T, options?: ValidatorOptions): Promise<Misfit[]> {
    options = options || this.options
    let misfits: Misfit[] = []
    let misfittingProperties: string[] = []

    for (let entry of this.entries) {
      let propertyAlreadyHasAMisfit = false

      for (let property of entry.properties) {
        if (misfittingProperties.indexOf(property) > -1) {
          propertyAlreadyHasAMisfit = true
          break
        }
      }

      if (propertyAlreadyHasAMisfit) {
        continue
      }

      if (entry.condition && ! await entry.condition(object)) {
        continue
      }

      let atLeastOnePropertyExists = false
      for (let property of entry.properties) {
        let dotNotation = new DotNotation(property)

        if (dotNotation.exists(object)) {
          atLeastOnePropertyExists = true
          break
        }
      }

      if (! atLeastOnePropertyExists && options && options.checkOnlyWhatIsThere) {
        continue
      }

      if (entry.constraint != undefined) {
        let misfit

        if (entry.properties.length == 0) {
          misfit = await entry.constraint.validate(object)
        }
        else if (entry.properties.length == 1) {
          let property = entry.properties[0]
          let dotNotation = new DotNotation(property)
          let value = dotNotation.get(object)
          misfit = await entry.constraint.validate(value)
        }
        else {
          misfit = await entry.constraint.validateMultipleProperties(object, entry.properties)
        }

        if (misfit) {
          if (misfit.constraint === undefined) {
            misfit.constraint = entry.constraint.name
          }

          misfit.properties = entry.properties.slice()

          misfittingProperties.push(...entry.properties)
          misfits.push(misfit)
        }
      }
      else if (entry.validator != undefined) {
        if (entry.properties.length != 1) {
          throw new Error('Using another validator only works for one property')
        }

        let property = entry.properties[0]
        let dotNotation = new DotNotation(property)
        let value = dotNotation.get(object)

        if (value === undefined) {
          continue
        }

        if (value instanceof Array) {
          for (let i = 0; i < value.length; i++) {
            let subMisfits = await entry.validator.validate(value[i], options)

            if (subMisfits.length > 0) {
              for (let misfit of subMisfits) {
                misfit.addPrefix(`${property}[${i}].`)
              }

              misfittingProperties.push(...entry.properties)
              misfits.push(...subMisfits)
            }
          }
        }
        else {
          let subMisfits = await entry.validator.validate(value, options)

          if (subMisfits.length > 0) {
            for (let misfit of subMisfits) {
              misfit.addPrefix(property + '.')
            }

            misfittingProperties.push(...entry.properties)
            misfits.push(...subMisfits)
          }
        }
      }
    }

    return misfits
  }
}
