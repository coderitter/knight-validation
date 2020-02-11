import Constraint from '../Constraint'
import Misfit from '../Misfit'

export default class Required extends Constraint {

  async validate(value: any): Promise<Misfit|undefined> {
    if (Required.missing(value)) {
      return new Misfit(this.name)
    }
  }

  static missing(value: any): boolean {
    return value === undefined || 
      value === null || 
      value === '' || 
      typeof value === 'number' && isNaN(value)
  }
}