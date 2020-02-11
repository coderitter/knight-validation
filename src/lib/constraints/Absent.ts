import Constraint from '../Constraint'
import Misfit from '../Misfit'
import Required from './Required'

export default class Absent extends Constraint {

  async validate(value: any, obj?: any): Promise<Misfit|undefined> {
    if (! Required.missing(value)) {
      return new Misfit(this.name)
    }
  }
}