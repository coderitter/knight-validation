import Constraint from './Constraint'
import QuickConstraint from './constraints/QuickConstraint'
import fieldsEqual from './fieldsEqual'
import Misfit from './Misfit'

export interface ValidatorOptions {
  checkOnlyWhatIsThere?: boolean,
  include?: (string | string[] | { field: string|string[], constraint?: string|string[] })[]
  exclude?: (string | string[] | { field: string|string[], constraint?: string|string[] })[]
}

export default class Validator {

  fieldConstraints: FieldConstraint[] = []

  add(field: string|string[], constraint: Constraint, condition?: (object: any) => Promise<boolean>): void
  add(field: string|string[], constraintName: string, validate: (object: any, field: string|string[]) => Promise<Misfit|undefined>, condition?: (object: any) => Promise<boolean>): void
  add(validator: Validator): void
  
  add(fieldOrValidator: string|string[]|Validator, constraintOrConstraintName?: Constraint|string, conditionOrValidate?: ((object: any) => Promise<boolean>)|((object: any, field: string|string[]) => Promise<Misfit|undefined>), condition?: (object: any) => Promise<boolean>): void {
    if (fieldOrValidator instanceof Validator) {
      let validator = fieldOrValidator

      for (let fieldConstraint of validator.fieldConstraints) {
        this.fieldConstraints.push(fieldConstraint)
      }
    }
    else {
      let field = fieldOrValidator
      
      let constraint
      if (typeof constraintOrConstraintName == 'string') {
        constraint = new QuickConstraint(constraintOrConstraintName, <any> conditionOrValidate)
        condition = condition
      }
      else if (constraintOrConstraintName instanceof Constraint) {
        constraint = constraintOrConstraintName
        condition = <any> conditionOrValidate
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

  constraints(field: string|string[]): Constraint[] {
    let constraints: Constraint[] = []
    
    for (let fieldConstraint of this.fieldConstraints) {
      if (field === fieldConstraint.field) {
        constraints.push(fieldConstraint.constraint)
      }
      else if (field instanceof Array && fieldConstraint.fields && fieldsEqual(field, fieldConstraint.fields)) {
        constraints.push(fieldConstraint.constraint)
      }
    }

    return constraints
  }

  fieldConstraintsForField(field: string|string[]): FieldConstraint[] {
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
      
      let constraints = this.fieldConstraintsForField(field)

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

        let misfit = await constraint.validate(object, field)

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

      let constraints = this.fieldConstraintsForField(fields)

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

        let misfit = await constraint.validate(object, fields)

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

    return misfits
  }
}

class FieldConstraint {
  field?: string
  fields?: string[]
  constraint!: Constraint
  condition?: (object: any) => Promise<boolean>

  constructor(field: string|string[], constraint: Constraint, condition?: (object: any) => Promise<boolean>) {
    this.field = typeof field == 'string' ? field : undefined
    this.fields = field instanceof Array ? field : undefined
    this.constraint = constraint
    this.condition = condition
  }

  async validate(value: any, object: any): Promise<Misfit|undefined> {
    return await this.constraint.validate(value, object)
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
    constraintName1 = constraint1.constraint.name
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
    constraintName2 = constraint2.constraint.name
  }
  else {
    throw new Error('Unexpected constraint type')
  }

  return constraintName1 === constraintName2
}