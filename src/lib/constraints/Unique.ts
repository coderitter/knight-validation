import Constraint from '../Constraint'
import Misfit from '../Misfit'

export default class Unique extends Constraint {

  isUnique: (value: any) => Promise<boolean>

  constructor(isUnique: (value: any) => Promise<boolean>) {
    super()
    this.isUnique = isUnique
  }

  async validate(value: any): Promise<Misfit|undefined> {
    if (! await this.isUnique(value)) {
      return new Misfit(this.name)
    }
  }
}