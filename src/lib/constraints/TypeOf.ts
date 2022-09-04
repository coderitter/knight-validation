import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export interface TypeOfMisfitValues {
  types: (string|null)[]
  actual: string|null
}

export class TypeOf<T = any> extends Constraint<T, TypeOfMisfitValues> {

  valueTypes: (string|null|(new (...params: any[]) => any))[]

  constructor(...valueTypes: (string|null|(new (...params: any[]) => any))[]) {
    super()
    this.valueTypes = valueTypes
  }

  async validate(obj: T, property: string|string[]): Promise<Misfit<TypeOfMisfitValues>|undefined> {
    return this.defaultValidation(obj, property, async (value: any) => {
      for (let valueType of this.valueTypes) {
        if (typeof valueType == 'string') {
          if (typeof value === valueType) {
            return 
          }  
        }
        else if (valueType === null) {
          if (value === null) {
            return 
          }
        }
        else if (value instanceof valueType) {
          return
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

      let misfit = new Misfit<TypeOfMisfitValues>()
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
    })
  }
}
