import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export class TypeOf extends Constraint {

  valueTypes: (string|null|(new (...params: any[]) => any))[]

  constructor(...valueTypes: (string|null|(new (...params: any[]) => any))[]) {
    super()
    this.valueTypes = valueTypes
  }

  async validate(obj: any, field: string|string[]): Promise<Misfit|undefined> {
    return this.defaultValidation(obj, field, async (value: any) => {
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

      let misfit = new Misfit
      misfit.constraints = <TypeOfConstraints> { types: [] }

      for (let valueType of this.valueTypes) {
        if (typeof valueType == 'string' || valueType === null) {
          misfit.constraints.types.push(valueType)
        }
        else {
          misfit.constraints.types.push(valueType.name)
        }
      }

      return misfit
    })
  }
}

export interface TypeOfConstraints {
  types: string[]
}