import { Constraint } from './Constraint'
import { QuickConstraint } from './constraints/QuickConstraint'
import { fieldsEqual } from './fieldsEqual'
import { Misfit } from './Misfit'

export interface ValidatorOptions {
  checkOnlyWhatIsThere?: boolean,
  include?: (string | string[] | { field: string|string[], constraint?: string|string[] })[]
  exclude?: (string | string[] | { field: string|string[], constraint?: string|string[] })[]
}

export class Validator {

  options?: ValidatorOptions
  fieldConstraints: FieldConstraint[] = []
  
  constructor(options?: ValidatorOptions) {
    this.options = options
  }

  add(field: string|string[], constraint: Constraint, condition?: (object: any) => Promise<boolean>): void
  add(field: string|string[], constraintName: string, validate: (object: any, field: string|string[]) => Promise<Misfit|undefined>, condition?: (object: any) => Promise<boolean>): void
  add(field: string|string[], validator: Validator, condition?: (object: any) => Promise<boolean>): void
  add(validator: Validator): void
  
  add(arg0: any, arg1?: any, arg2?: any, arg3?: any): void {
    if (arg0 instanceof Validator) {
      let validator = arg0

      for (let fieldConstraint of validator.fieldConstraints) {
        this.fieldConstraints.push(fieldConstraint)
      }
    }
    else {
      let field = arg0
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
  
      this.fieldConstraints.push(new FieldConstraint(field, constraint, condition))
    }
  }

  get fields(): (string|string[])[] {
    let fields: (string|string[])[] = []

    for (let fieldConstraint of this.fieldConstraints) {
      if (fieldConstraint.field != undefined) {
        fields.push(fieldConstraint.field)
      }
      else if (fieldConstraint.fields != undefined) {
        fields.push(fieldConstraint.fields)
      }
    }

    return fields
  }

  get singleFields(): string[] {
    let fields: string[] = []

    for (let fieldConstraint of this.fieldConstraints) {
      if (fieldConstraint.field != undefined && fields.indexOf(fieldConstraint.field) == -1) {
        fields.push(fieldConstraint.field)
      }
    }

    return fields
  }

  get combinedFields(): string[][] {
    let fields: string[][] = []

    for (let fieldConstraint of this.fieldConstraints) {
      if (fieldConstraint.fields != undefined && ! fields.some((fields: string[]) => fieldsEqual(fields, fieldConstraint.fields))) {
        fields.push(fieldConstraint.fields)
      }
    }

    return fields
  }

  constraints(field: string|string[]): FieldConstraint[] {
    let fieldConstraints: FieldConstraint[] = []
    
    for (let fieldConstraint of this.fieldConstraints) {
      if (field === fieldConstraint.field) {
        fieldConstraints.push(fieldConstraint)
      }
      else if (field instanceof Array && fieldConstraint.fields && fieldsEqual(field, fieldConstraint.fields)) {
        fieldConstraints.push(fieldConstraint)
      }
    }

    return fieldConstraints
  }

  async validate(object: any, options?: ValidatorOptions): Promise<Misfit[]> {
    options = options || this.options
    let misfits: Misfit[] = []
    let misfittingFields: string[] = []

    for (let field of this.singleFields) {
      if (options && options.include instanceof Array && ! containsField(options.include, field)) {
        continue
      }

      if (options && options.exclude instanceof Array && containsFieldWithoutConstraints(options.exclude, field)) {
        continue
      }

      if (object[field] === undefined && options && options.checkOnlyWhatIsThere) {
        continue
      }
      
      let constraints = this.constraints(field)

      for (let constraint of constraints) {
        if (options && options.include instanceof Array && ! (containsFieldWithoutConstraints(options.include, field) || containsFieldAndConstraint(options.include, field, constraint))) {
          continue
        }

        if (options && options.exclude instanceof Array && containsFieldAndConstraint(options.exclude, field, constraint)) {
          continue
        }
    
        if (constraint.condition != undefined && ! await constraint.condition(object)) {
          continue
        }

        if (constraint.constraint != undefined) {
          let misfit = await constraint.validateConstraint(object, field)

          if (misfit) {
            misfit.field = field
  
            if (misfit.name === undefined) {
              misfit.name = constraint.constraint.name
            }
  
            misfittingFields.push(field)
            misfits.push(misfit)
            break
          }
        }
        else if (constraint.validator != undefined) {
          let fieldValue = object[field]

          if (fieldValue == undefined) {
            continue
          }

          let subMisfits = await constraint.validateValidator(fieldValue)

          for (let misfit of subMisfits) {
            misfit.field = field + '.' + misfit.field
          }

          misfits.push(...subMisfits)
        }
      }
    }

    for (let fields of this.combinedFields) {
      if (options && options.include instanceof Array && ! containsField(options.include, fields)) {
        continue
      }

      if (options && options.exclude instanceof Array && containsFieldWithoutConstraints(options.exclude, fields)) {
        continue
      }

      let oneOfTheFieldsAlreadyHasAMisfit = false
      for (let field of fields) {
        if (misfittingFields.indexOf(field) > -1) {
          oneOfTheFieldsAlreadyHasAMisfit = true
          break
        }
      }

      if (oneOfTheFieldsAlreadyHasAMisfit) {
        continue
      }

      let atLeastOneOfTheFieldsMissingInObject = false
      for (let field of fields) {
        if (object[field] === undefined) {
          atLeastOneOfTheFieldsMissingInObject = true
          break
        }
      }

      if (atLeastOneOfTheFieldsMissingInObject && options && options.checkOnlyWhatIsThere) {
        continue
      }

      let constraints = this.constraints(fields)

      for (let constraint of constraints) {
        if (options && options.include instanceof Array && ! (containsFieldWithoutConstraints(options.include, fields) || containsFieldAndConstraint(options.include, fields, constraint))) {
          continue
        }
  
        if (options && options.exclude instanceof Array && containsFieldAndConstraint(options.exclude, fields, constraint)) {
          continue
        }
  
        if (constraint.condition != undefined && ! await constraint.condition(object)) {
          continue
        }

        if (constraint.constraint != undefined) {
          let misfit = await constraint.validateConstraint(object, fields)

          if (misfit) {
            misfit.fields = fields
  
            if (misfit.name === undefined) {
              misfit.name = constraint.constraint.name
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

class FieldConstraint {
  field?: string
  fields?: string[]
  constraint?: Constraint
  validator?: Validator
  condition?: (object: any) => Promise<boolean>

  constructor(field: string|string[], constraintOrValidator: Constraint|Validator, condition?: (object: any) => Promise<boolean>) {
    this.field = typeof field == 'string' ? field : undefined
    this.fields = field instanceof Array ? field : undefined
    this.constraint = constraintOrValidator instanceof Constraint ? constraintOrValidator : undefined
    this.validator = constraintOrValidator instanceof Validator ? constraintOrValidator : undefined
    this.condition = condition
  }

  async validateConstraint(value: any, object: any): Promise<Misfit|undefined> {
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

function containsField(fieldsAndConstraints: (string|string[]|{field: string|string[], constraint?: string|string[]})[], field: string|string[]): boolean {
  for (let fieldAndConstraint of fieldsAndConstraints) {
    if (typeof fieldAndConstraint == 'string') {
      if (fieldAndConstraint == field) {
        return true
      }
    }
    else if (fieldAndConstraint instanceof Array) {
      if (field instanceof Array && fieldsEqual(fieldAndConstraint, field)) {
        return true
      }
    }
    else if (typeof fieldAndConstraint == 'object' && 'field' in fieldAndConstraint) {
      if (containsField([fieldAndConstraint.field], field)) {
        return true
      }
    }
  }

  return false
}

function containsFieldWithoutConstraints(fieldsAndConstraints: (string|string[]|{field: string|string[], constraint?: string|string[]})[], field: string|string[]): boolean {
  for (let fieldAndConstraint of fieldsAndConstraints) {
    if (typeof fieldAndConstraint == 'string') {
      if (fieldAndConstraint == field) {
        return true
      }
    }
    else if (fieldAndConstraint instanceof Array) {
      if (field instanceof Array && fieldsEqual(fieldAndConstraint, field)) {
        return true
      }
    }
    else if (typeof fieldAndConstraint == 'object' && 'field' in fieldAndConstraint) {
      if (containsField([fieldAndConstraint.field], field)) {
        return fieldAndConstraint.constraint == undefined
      }
    }
  }

  return false
}

function containsFieldAndConstraint(fieldsAndConstraints: (string|string[]|{field: string|string[], constraint?: string|string[]})[], field: string|string[], constraint: string|Constraint|FieldConstraint): boolean {
  for (let fieldAndConstraint of fieldsAndConstraints) {
    if (typeof fieldAndConstraint == 'object' && 'field' in fieldAndConstraint && 'constraint' in fieldAndConstraint) {

      if (typeof fieldAndConstraint.constraint == 'string') {
        if (constraintNamesEqual(fieldAndConstraint.constraint, constraint)) {
          if (typeof fieldAndConstraint.field == 'string' && fieldAndConstraint.field === field) {
            return true
          }
        
          if (fieldAndConstraint.field instanceof Array && field instanceof Array && fieldsEqual(fieldAndConstraint.field, field)) {
            return true
          }
        }          
      }
      else if (fieldAndConstraint.constraint instanceof Array) {
        for (let constraintName of fieldAndConstraint.constraint) {
          if (constraintNamesEqual(constraintName, constraint)) {
            if (typeof fieldAndConstraint.field == 'string' && fieldAndConstraint.field === field) {
              return true
            }
          
            if (fieldAndConstraint.field instanceof Array && field instanceof Array && fieldsEqual(fieldAndConstraint.field, field)) {
              return true
            }
          }
        }
      }
    }
  }

  return false
}

function constraintNamesEqual(constraint1: string|Constraint|FieldConstraint, constraint2: string|Constraint|FieldConstraint): boolean {
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
  else if (constraint1 instanceof FieldConstraint) {
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
  else if (constraint2 instanceof FieldConstraint) {
    constraintName2 = constraint2.constraint?.name
  }
  else {
    throw new Error('Unexpected constraint type')
  }

  return constraintName1 === constraintName2
}