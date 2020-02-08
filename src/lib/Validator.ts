import Constraint from './Constraint'
import Misfit from './Misfit'

export interface ValidatorOptions {
  checkOnlyWhatIsThere?: boolean
}

export default class Validator {

  fieldConstraints: { 
    field?: string,
    fields?: string[],
    constraint: Constraint|((value: any, object: any) => Promise<Misfit|undefined>)
  }[] = []

  add(field: string|string[], constraint: Constraint|((value: any, object: any) => Promise<Misfit|undefined>)) {
    this.fieldConstraints.push({
      field: typeof field == 'string' ? field : undefined,
      fields: field instanceof Array ? field : undefined,
      constraint: constraint
    })
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

  constraints(field: string|string[]): (Constraint|((value: any, object: any) => Promise<Misfit|undefined>))[] {
    let constraints: (Constraint|((value: any, object: any) => Promise<Misfit|undefined>))[] = []
    
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

  async validate(object: any, options?: ValidatorOptions): Promise<Misfit[]> {
    let misfits: Misfit[] = []
    let misfittingFields: string[] = []

    for (let field of this.singleFields) {
      if (! (field in object) && options && options.checkOnlyWhatIsThere) {
        continue
      }

      let constraints = this.constraints(field)

      for (let constraint of constraints) {
        let misfit

        if (constraint instanceof Constraint) {
          misfit = await constraint.validate(object[field], object)
        }
        else {
          misfit = await constraint(object[field], object)
        }

        if (misfit) {
          misfittingFields.push(field)
          misfit.field = field              
          misfits.push(misfit)
          break
        }    
      }
    }

    for (let fields of this.combinedFields) {
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
        if (! (field in object)) {
          atLeastOneOfTheFieldsMissingInObject = true
          break
        }
      }

      if (atLeastOneOfTheFieldsMissingInObject && options && options.checkOnlyWhatIsThere) {
        continue
      }

      let constraints = this.constraints(fields)

      for (let constraint of constraints) {
        let misfit

        if (constraint instanceof Constraint) {
          misfit = await constraint.validate(undefined, object)
        }
        else {
          misfit = await constraint(undefined, object)
        }

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
