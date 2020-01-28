import Constraint from './Constraint'
import Misfit from './Misfit'

export interface ValidatorOptions {
  checkOnlyWhatIsThere?: boolean
}

export default class Validator {

  constraints: {[field: string]: (Constraint|((value: any, object: any) => Misfit|undefined))[]} = {}

  add(fieldOrConstraintOrValidate: string|Constraint|((value: any, object: any) => Misfit|undefined), constraintOrValidate?: Constraint|((value: any, object: any) => Misfit|undefined)) {
    let field: string
    let constraint: Constraint|((value: any, object: any) => Misfit|undefined)

    if (fieldOrConstraintOrValidate instanceof Constraint) {
      field = ''
      constraint = fieldOrConstraintOrValidate
    }
    else if (typeof fieldOrConstraintOrValidate === 'function') {
      field = ''
      constraint = fieldOrConstraintOrValidate
    }
    else if (constraintOrValidate instanceof Constraint) {
      field = fieldOrConstraintOrValidate
      constraint = constraintOrValidate
    }
    else if (typeof constraintOrValidate == 'function') {
      field = fieldOrConstraintOrValidate
      constraint = constraintOrValidate
    }
    else {
      throw new Error('Unexpected parameter')
    }

    if (!(field in this.constraints)) {
      this.constraints[field] = []
    }

    this.constraints[field].push(constraint)
  }

  async validate(object: any, options?: ValidatorOptions): Promise<Misfit[]> {
    let misfits: Misfit[] = []

    for (let field in this.constraints) {
      let fieldConstraints = this.constraints[field]

      if (field in object || ! options || options && ! options.checkOnlyWhatIsThere) {
        for (let constraint of fieldConstraints) {
          let misfit
          if (constraint instanceof Constraint) {
            misfit = await constraint.validate(object[field], object)
          }
          else {
            misfit = constraint(object[field], object)
          }
          
          if (misfit) {
            if (field) {
              misfit.field = field
            }

            if (! misfit.name) {
              misfit.name = constraint.name
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