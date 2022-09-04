import { Constraint } from './Constraint'
import { QuickConstraint } from './constraints/QuickConstraint'
import { arePropertiesEqual } from './tools'
import { Misfit } from './Misfit'

export interface ValidatorOptions {
  checkOnlyWhatIsThere?: boolean,
  include?: (string | string[] | { properties: string|string[], constraint?: string|string[] })[]
  exclude?: (string | string[] | { properties: string|string[], constraint?: string|string[] })[]
}

export class Validator<T = any> {

  options?: ValidatorOptions
  propertyConstraints: PropertyConstraint[] = []
  
  constructor(options?: ValidatorOptions) {
    this.options = options
  }

  add(properties: string|string[], constraint: Constraint<T>, condition?: (object: any) => Promise<boolean>): void
  add(properties: string|string[], constraintName: string, validate: (object: any, properties: string|string[]) => Promise<Misfit|null>, condition?: (object: any) => Promise<boolean>): void
  add(properties: string|string[], validator: Validator, condition?: (object: any) => Promise<boolean>): void
  add(validator: Validator): void
  
  add(arg0: any, arg1?: any, arg2?: any, arg3?: any): void {
    if (arg0 instanceof Validator) {
      let validator = arg0

      for (let propertyConstraint of validator.propertyConstraints) {
        this.propertyConstraints.push(propertyConstraint)
      }
    }
    else {
      let property = arg0
      let constraint
      let condition

      if (typeof arg1 == 'string') {
        constraint = new QuickConstraint(arg1, <any> arg2)
        condition = arg3
      }
      else if (arg1 instanceof Constraint) {
        constraint = arg1
        condition = arg2
      }
      else if (arg1 instanceof Validator) {
        constraint = arg1
        condition = arg2
      }
      else {
        throw new Error('Wrong parameters')
      }
  
      this.propertyConstraints.push(new PropertyConstraint(property, constraint, condition))
    }
  }

  get properties(): (string|string[])[] {
    let properties: (string|string[])[] = []

    for (let propertyConstraint of this.propertyConstraints) {
      if (propertyConstraint.property != undefined) {
        properties.push(propertyConstraint.property)
      }
      else if (propertyConstraint.properties != undefined) {
        properties.push(propertyConstraint.properties)
      }
    }

    return properties
  }

  get singleProperties(): string[] {
    let properties: string[] = []

    for (let propertyConstraint of this.propertyConstraints) {
      if (propertyConstraint.property != undefined && properties.indexOf(propertyConstraint.property) == -1) {
        properties.push(propertyConstraint.property)
      }
    }

    return properties
  }

  get combinedProperties(): string[][] {
    let properties: string[][] = []

    for (let propertyConstraint of this.propertyConstraints) {
      if (propertyConstraint.properties != undefined && ! properties.some((properties: string[]) => arePropertiesEqual(properties, propertyConstraint.properties))) {
        properties.push(propertyConstraint.properties)
      }
    }

    return properties
  }

  constraints(property: string|string[]): PropertyConstraint[] {
    let propertyConstraints: PropertyConstraint[] = []
    
    for (let propertyConstraint of this.propertyConstraints) {
      if (property === propertyConstraint.property) {
        propertyConstraints.push(propertyConstraint)
      }
      else if (property instanceof Array && propertyConstraint.properties && arePropertiesEqual(property, propertyConstraint.properties)) {
        propertyConstraints.push(propertyConstraint)
      }
    }

    return propertyConstraints
  }

  async validate(object: any, options?: ValidatorOptions): Promise<Misfit[]> {
    options = options || this.options
    let misfits: Misfit[] = []
    let misfittingProperties: string[] = []

    for (let property of this.singleProperties) {
      if (options && options.include instanceof Array && ! containsProperty(options.include, property)) {
        continue
      }

      if (options && options.exclude instanceof Array && containsPropertyWithoutConstraints(options.exclude, property)) {
        continue
      }

      if (object[property] === undefined && options && options.checkOnlyWhatIsThere) {
        continue
      }
      
      let constraints = this.constraints(property)

      for (let constraint of constraints) {
        if (options && options.include instanceof Array && ! (containsPropertyWithoutConstraints(options.include, property) || containsPropertyAndConstraint(options.include, property, constraint))) {
          continue
        }

        if (options && options.exclude instanceof Array && containsPropertyAndConstraint(options.exclude, property, constraint)) {
          continue
        }
    
        if (constraint.condition != undefined && ! await constraint.condition(object)) {
          continue
        }

        if (constraint.constraint != undefined) {
          let misfit = await constraint.validateConstraint(object, property)

          if (misfit) {
            misfit.property = property
  
            if (misfit.constraint === undefined) {
              misfit.constraint = constraint.constraint.name
            }
  
            misfittingProperties.push(property)
            misfits.push(misfit)
            break
          }
        }
        else if (constraint.validator != undefined) {
          let propertyValue = object[property]

          if (propertyValue == undefined) {
            continue
          }

          let subMisfits = await constraint.validateValidator(propertyValue)

          for (let misfit of subMisfits) {
            misfit.property = property + '.' + misfit.property
          }

          misfits.push(...subMisfits)
        }
      }
    }

    for (let properties of this.combinedProperties) {
      if (options && options.include instanceof Array && ! containsProperty(options.include, properties)) {
        continue
      }

      if (options && options.exclude instanceof Array && containsPropertyWithoutConstraints(options.exclude, properties)) {
        continue
      }

      let oneOfThePropertiesAlreadyHasAMisfit = false
      for (let property of properties) {
        if (misfittingProperties.indexOf(property) > -1) {
          oneOfThePropertiesAlreadyHasAMisfit = true
          break
        }
      }

      if (oneOfThePropertiesAlreadyHasAMisfit) {
        continue
      }

      let atLeastOneOfThePropertiesMissingInObject = false
      for (let property of properties) {
        if (object[property] === undefined) {
          atLeastOneOfThePropertiesMissingInObject = true
          break
        }
      }

      if (atLeastOneOfThePropertiesMissingInObject && options && options.checkOnlyWhatIsThere) {
        continue
      }

      let constraints = this.constraints(properties)

      for (let constraint of constraints) {
        if (options && options.include instanceof Array && ! (containsPropertyWithoutConstraints(options.include, properties) || containsPropertyAndConstraint(options.include, properties, constraint))) {
          continue
        }
  
        if (options && options.exclude instanceof Array && containsPropertyAndConstraint(options.exclude, properties, constraint)) {
          continue
        }
  
        if (constraint.condition != undefined && ! await constraint.condition(object)) {
          continue
        }

        if (constraint.constraint != undefined) {
          let misfit = await constraint.validateConstraint(object, properties)

          if (misfit) {
            misfit.properties = properties
  
            if (misfit.constraint === undefined) {
              misfit.constraint = constraint.constraint.name
            }
  
            misfits.push(misfit)
            break
          }
        }
      }
    }

    return misfits
  }
}

class PropertyConstraint {
  property?: string
  properties?: string[]
  constraint?: Constraint
  validator?: Validator
  condition?: (object: any) => Promise<boolean>

  constructor(property: string|string[], constraintOrValidator: Constraint|Validator, condition?: (object: any) => Promise<boolean>) {
    this.property = typeof property == 'string' ? property : undefined
    this.properties = property instanceof Array ? property : undefined
    this.constraint = constraintOrValidator instanceof Constraint ? constraintOrValidator : undefined
    this.validator = constraintOrValidator instanceof Validator ? constraintOrValidator : undefined
    this.condition = condition
  }

  async validateConstraint(value: any, object: any): Promise<Misfit|null> {
    if (this.constraint == undefined) {
      throw new Error('Could not validate constraint because it is not set')
    }

    return this.constraint.validate(value, object)
  }

  async validateValidator(value: any): Promise<Misfit[]> {
    if (this.validator == undefined) {
      throw new Error('Could not validate with validator because it is not set')
    }

    return this.validator.validate(value)
  }
}

function containsProperty(propertiesAndConstraints: (string|string[]|{properties: string|string[], constraint?: string|string[]})[], property: string|string[]): boolean {
  for (let propertyAndConstraint of propertiesAndConstraints) {
    if (typeof propertyAndConstraint == 'string') {
      if (propertyAndConstraint == property) {
        return true
      }
    }
    else if (propertyAndConstraint instanceof Array) {
      if (property instanceof Array && arePropertiesEqual(propertyAndConstraint, property)) {
        return true
      }
    }
    else if (typeof propertyAndConstraint == 'object' && 'properties' in propertyAndConstraint) {
      if (containsProperty([propertyAndConstraint.properties], property)) {
        return true
      }
    }
  }

  return false
}

function containsPropertyWithoutConstraints(propertiesAndConstraints: (string|string[]|{properties: string|string[], constraint?: string|string[]})[], property: string|string[]): boolean {
  for (let propertyAndConstraint of propertiesAndConstraints) {
    if (typeof propertyAndConstraint == 'string') {
      if (propertyAndConstraint == property) {
        return true
      }
    }
    else if (propertyAndConstraint instanceof Array) {
      if (property instanceof Array && arePropertiesEqual(propertyAndConstraint, property)) {
        return true
      }
    }
    else if (typeof propertyAndConstraint == 'object' && 'properties' in propertyAndConstraint) {
      if (containsProperty([propertyAndConstraint.properties], property)) {
        return propertyAndConstraint.constraint == undefined
      }
    }
  }

  return false
}

function containsPropertyAndConstraint(propertiesAndConstraints: (string|string[]|{properties: string|string[], constraint?: string|string[]})[], property: string|string[], constraint: string|Constraint|PropertyConstraint): boolean {
  for (let propertyAndConstraint of propertiesAndConstraints) {
    if (typeof propertyAndConstraint == 'object' && 'properties' in propertyAndConstraint && 'constraint' in propertyAndConstraint) {

      if (typeof propertyAndConstraint.constraint == 'string') {
        if (constraintNamesEqual(propertyAndConstraint.constraint, constraint)) {
          if (typeof propertyAndConstraint.properties == 'string' && propertyAndConstraint.properties === property) {
            return true
          }
        
          if (propertyAndConstraint.properties instanceof Array && property instanceof Array && arePropertiesEqual(propertyAndConstraint.properties, property)) {
            return true
          }
        }          
      }
      else if (propertyAndConstraint.constraint instanceof Array) {
        for (let constraintName of propertyAndConstraint.constraint) {
          if (constraintNamesEqual(constraintName, constraint)) {
            if (typeof propertyAndConstraint.properties == 'string' && propertyAndConstraint.properties === property) {
              return true
            }
          
            if (propertyAndConstraint.properties instanceof Array && property instanceof Array && arePropertiesEqual(propertyAndConstraint.properties, property)) {
              return true
            }
          }
        }
      }
    }
  }

  return false
}

function constraintNamesEqual(constraint1: string|Constraint|PropertyConstraint, constraint2: string|Constraint|PropertyConstraint): boolean {
  if (constraint1 === constraint2) {
    return true
  }

  if (constraint1 == undefined || constraint2 == undefined) {
    return false
  }

  let constraintName1
  let constraintName2

  if (typeof constraint1 == 'string') {
    constraintName1 = constraint1
  }
  else if (constraint1 instanceof Constraint) {
    constraintName1 = constraint1.name
  }
  else if (constraint1 instanceof PropertyConstraint) {
    constraintName1 = constraint1.constraint?.name
  }
  else {
    throw new Error('Unexpected constraint type')
  }

  if (typeof constraint2 == 'string') {
    constraintName2 = constraint2
  }
  else if (constraint2 instanceof Constraint) {
    constraintName2 = constraint2.name
  }
  else if (constraint2 instanceof PropertyConstraint) {
    constraintName2 = constraint2.constraint?.name
  }
  else {
    throw new Error('Unexpected constraint type')
  }

  return constraintName1 === constraintName2
}