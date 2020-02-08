import Constraint from '../Constraint'
import Misfit from '../Misfit'

export default class TypeOf extends Constraint {

  type: string

  constructor(type: string) {
    super()
    this.type = type
  }

  async validate(value: any, obj?: any): Promise<Misfit|undefined> {
    if (value === undefined) {
      return
    }
    
    if (typeof value !== this.type) {
      let misfit = new Misfit(this.type)
      misfit.constraints = <TypeOfConstraints> { type: this.type }
      return misfit
    }
  }
}

export interface TypeOfConstraints {
  type: string
}