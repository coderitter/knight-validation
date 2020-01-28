import Constraint from '../Constraint'
import Misfit from '../Misfit'

export default class Exists extends Constraint {

  isExists: (value: any) => Promise<boolean>

  constructor(isExists: (value: any) => Promise<boolean>) {
    super()
    this.isExists = isExists
  }

  async validate(value: any): Promise<Misfit|undefined> {
    if (! await this.isExists(value)) {
      return new Misfit(this.name)
    }
  }
}