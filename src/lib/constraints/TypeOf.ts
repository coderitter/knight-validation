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
      return new Misfit(this.name)
    }
  }
}