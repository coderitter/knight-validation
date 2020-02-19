import Constraint from '../Constraint'
import Misfit from '../Misfit'

export default class TypeOf extends Constraint {

  valueType: string

  constructor(valueType: string) {
    super()
    this.valueType = valueType
  }

  async validate(obj: any, field: string|string[]): Promise<Misfit|undefined> {
    return this.defaultValidation(obj, field, async (value: any) => {
      if (typeof value !== this.valueType) {
        let misfit = new Misfit
        misfit.constraints = <TypeOfConstraints> { type: this.valueType }
        return misfit
      }
    })
  }
}

export interface TypeOfConstraints {
  type: string
}