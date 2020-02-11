import { Required } from '../..'
import Constraint from '../Constraint'
import Misfit from '../Misfit'

export default class TypeOf extends Constraint {

  valueType: string

  constructor(valueType: string) {
    super()
    this.valueType = valueType
  }

  async validate(value: any, obj?: any): Promise<Misfit|undefined> {
    if (Required.missing(value)) {
      return
    }
    
    if (typeof value !== this.valueType) {
      let misfit = new Misfit(this.name)
      misfit.constraints = <TypeOfConstraints> { type: this.valueType }
      return misfit
    }
  }
}

export interface TypeOfConstraints {
  type: string
}