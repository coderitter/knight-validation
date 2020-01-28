import Constraint from '../Constraint'
import Misfit from '../Misfit'

export default class Unique extends Constraint {

  isUnique: (value: any) => boolean

  constructor(isUnique: (value: any) => boolean) {
    super()
    this.isUnique = isUnique
  }

  validate(value: any): Misfit|undefined {
    if (! this.isUnique(value)) {
      return new Misfit(this.name)
    }
  }
}