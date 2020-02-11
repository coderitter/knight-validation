import Constraint from './Constraint'
import Misfit from './Misfit'
import QuickConstraint from './QuickConstraint'

export interface ValidatorOptions {
  checkOnlyWhatIsThere?: boolean,
  exclude?: [ string | string[] | {field: string|string[], constraintName?: string|string[]} ]
}

export default class Validator {

  fieldConstraints: FieldConstraint[] = []

  add(field: string|string[], constraint: Constraint, condition?: (object: any) => Promise<boolean>): void
  add(field: string|string[], constraintName: string, validate: (value: any, object: any) => Promise<Misfit|undefined>, condition?: (object: any) => Promise<boolean>): void
  
  add(field: string|string[], constraintOrConstraintName: Constraint|string, conditionOrValidate?: ((object: any) => Promise<boolean>)|((value: any, object: any) => Promise<Misfit|undefined>), condition?: (object: any) => Promise<boolean>): void {
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
      if (fieldConstraint.fields != undefined && ! fields.some((fields: string[]) => arraysEqual(fields, fieldConstraint.fields))) {
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
      else if (field instanceof Array && fieldConstraint.fields && arraysEqual(field, fieldConstraint.fields)) {
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
      else if (field instanceof Array && fieldConstraint.fields && arraysEqual(field, fieldConstraint.fields)) {
        fieldConstraints.push(fieldConstraint)
      }
    }

    return fieldConstraints
  }

  async validate(object: any, options?: ValidatorOptions): Promise<Misfit[]> {
    let misfits: Misfit[] = []
    let misfittingFields: string[] = []

    for (let field of this.singleFields) {
      if (options && options.exclude instanceof Array && containsFieldAndConstraint(options.exclude, field)) {
        continue
      }

      if (object[field] === undefined && options && options.checkOnlyWhatIsThere) {
        continue
      }

      let constraints = this.fieldConstraintsForField(field)

      for (let constraint of constraints) {
        if (options && options.exclude instanceof Array && containsFieldAndConstraint(options.exclude, field, constraint)) {
          continue
        }
    
        if (constraint.condition != undefined && ! await constraint.condition(object)) {
          continue
        }

        let misfit = await constraint.validate(object[field], object)

        if (misfit) {
          misfittingFields.push(field)
          misfit.field = field
          misfits.push(misfit)
          break
        }    
      }
    }

    for (let fields of this.combinedFields) {
      if (options && options.exclude instanceof Array && containsFieldAndConstraint(options.exclude, fields)) {
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
        if (options && options.exclude instanceof Array && containsFieldAndConstraint(options.exclude, fields, constraint)) {
          continue
        }
  
        if (constraint.condition != undefined && ! await constraint.condition(object)) {
          continue
        }

        let misfit = await constraint.validate(undefined, object)

        if (misfit) {
          misfit.fields = fields
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

function containsFieldAndConstraint(fieldsAndConstraints: [string|string[]|{field: string|string[], constraintName?: string|string[]}], field: string|string[], constraint?: string|Constraint|FieldConstraint): boolean {
  for (let fieldAndConstraint of fieldsAndConstraints) {
    if (constraint == undefined) {
      if (typeof fieldAndConstraint == 'string') {
        if (fieldAndConstraint === field) {
          return true
        }
      }
      
      else if (fieldAndConstraint instanceof Array) {
        if (field instanceof Array && arraysEqual(fieldAndConstraint, field)) {
          return true
        }
      }

      else if (typeof fieldAndConstraint == 'object' && fieldAndConstraint.field != undefined && fieldAndConstraint.constraintName == undefined) {
        if (typeof fieldAndConstraint.field == 'string' && fieldAndConstraint.field === field) {
          return true
        }
      
        if (fieldAndConstraint.field instanceof Array && field instanceof Array && arraysEqual(fieldAndConstraint.field, field)) {
          return true
        }
      }
    }
    else if (typeof fieldAndConstraint == 'object' && 'field' in fieldAndConstraint && 'constraintName' in fieldAndConstraint) {
      let constraintName

      if (typeof constraint == 'string') {
        constraintName = constraint
      }
      else if (constraint instanceof Constraint) {
        constraintName = constraint.name
      }
      else if (constraint instanceof FieldConstraint) {
        constraintName = constraint.constraint.name
      }
      else {
        throw new Error('Unexpected constraint type')
      }

      if (typeof fieldAndConstraint.constraintName == 'string') {
        if (fieldAndConstraint.constraintName === constraintName) {
          if (typeof fieldAndConstraint.field == 'string' && fieldAndConstraint.field === field) {
            return true
          }
        
          if (fieldAndConstraint.field instanceof Array && field instanceof Array && arraysEqual(fieldAndConstraint.field, field)) {
            return true
          }
        }          
      }
      else if (fieldAndConstraint.constraintName instanceof Array) {
        for (let possibleConstraintName of fieldAndConstraint.constraintName) {
          if (possibleConstraintName === constraintName) {
            if (typeof fieldAndConstraint.field == 'string' && fieldAndConstraint.field === field) {
              return true
            }
          
            if (fieldAndConstraint.field instanceof Array && field instanceof Array && arraysEqual(fieldAndConstraint.field, field)) {
              return true
            }
          }
        }
      }
    }
  }

  return false
}

function arraysEqual(a1?: string[], a2?: string[]): boolean {
  if (! a1 || ! a2) {
    return false
  }

  if (a1.length != a2.length) {
    return false
  }

  for (let i = 0; i < a1.length; i++) {
    if (a2.indexOf(a1[i]) == -1) {
      return false
    }
  }

  return true
}
