import { Misfit } from 'knight-misfit'
import { Constraint, ConstraintMisfitValues } from '../Constraint'

export interface TypeOfMisfitValues extends ConstraintMisfitValues {
  types: (string|null)[]
  actual: string|null
}

export class TypeOf extends Constraint<any, TypeOfMisfitValues> {

  types: (string|null|(new (...params: any[]) => any))[] = []

  constructor(...valueTypes: (string|null|(new (...params: any[]) => any)|Partial<Constraint>)[]) {
    super()

    for (let i = 0; i < valueTypes.length; i++) {
      let valueType = valueTypes[i]

      if (i == valueTypes.length - 1 && 
        typeof valueType == 'object' && 
        valueType !== null
      ) {
        Object.assign(this, valueType)
      }
      else if (! (typeof valueType == 'object') || valueType === null) {
        this.types.push(valueType)
      }
    }
  }

  async validate(value: any): Promise<Misfit<TypeOfMisfitValues>|null> {
    if (value === undefined) {
      return null
    }

    for (let valueType of this.types) {
      if (typeof valueType == 'string') {
        if (typeof value === valueType && value !== null) {
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

    let misfit = new Misfit<TypeOfMisfitValues>(this.name, undefined, {
      actual: actualType,
      types: []
    })

    for (let valueType of this.types) {
      if (typeof valueType == 'string') {
        misfit.values!.types.push(valueType)
      }
      else if (valueType === null) {
        misfit.values!.types.push(null)
      }
      else {
        misfit.values!.types.push(valueType.name)
      }
    }

    return misfit
  }
}
