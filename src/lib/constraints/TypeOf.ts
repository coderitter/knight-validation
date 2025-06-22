import { Constraint, ConstraintMisfitValues } from '../Constraint'
import { Misfit } from '../Misfit'

export interface TypeOfMisfitValues extends ConstraintMisfitValues {
  types: (string|null)[]
  actual: string|null
}

export class TypeOf extends Constraint<any, TypeOfMisfitValues> {

  valueTypes: (string|null|(new (...params: any[]) => any))[]

  constructor(...valueTypes: (string|null|(new (...params: any[]) => any))[]) {
    super()
    this.valueTypes = valueTypes
  }

  async validate(value: any): Promise<Misfit<TypeOfMisfitValues>|null> {
    if (value === undefined) {
      return null
    }

    for (let valueType of this.valueTypes) {
      if (typeof valueType == 'string') {
        if (typeof value === valueType) {
          return null
        }  
      }
      else if (valueType === null) {
        if (value === null) {
          return null
        }
      }
      else if (value instanceof valueType) {
        return null
      }
    }

    let actualType: string|null

    if (typeof value =='object' && value !== null) {
      actualType = value.constructor.name
    }
    else if (value === null) {
      actualType = null
    }
    else {
      actualType = typeof value
    }

    let misfit = new Misfit<TypeOfMisfitValues>(this.name)
    misfit.values = {
      actual: actualType,
      types: []
    }

    for (let valueType of this.valueTypes) {
      if (typeof valueType == 'string') {
        misfit.values.types.push(valueType)
      }
      else if (valueType === null) {
        misfit.values.types.push(null)
      }
      else {
        misfit.values.types.push(valueType.name)
      }
    }

    return misfit
  }
}
