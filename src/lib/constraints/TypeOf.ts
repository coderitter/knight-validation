import Constraint from '../Constraint'
import Misfit from '../Misfit'

export default class TypeOf extends Constraint {

  valueType: string|(new (...params: any[]) => any)

  constructor(valueType: string)
  constructor(valueType: (new (...params: any[]) => any))
  constructor(valueType: any) {
    super()
    this.valueType = valueType
  }

  async validate(obj: any, field: string|string[]): Promise<Misfit|undefined> {
    return this.defaultValidation(obj, field, async (value: any) => {
      if (typeof this.valueType == 'string') {
        if (typeof value !== this.valueType) {
          let misfit = new Misfit
          misfit.constraints = <TypeOfConstraints> { type: this.valueType }
          return misfit
        }  
      }
      else {
        if (! (value instanceof this.valueType)) {
          let misfit = new Misfit
          misfit.constraints = <TypeOfConstraints> { type: this.valueType.name }
          return misfit
        }
      }
    })

    
  }
}

export interface TypeOfConstraints {
  type: string
}