import Constraint from '../Constraint'
import Misfit from '../Misfit'

export default class Exists extends Constraint {

  isExists: (value: any, obj: any) => Promise<boolean>

  constructor(isExists: (obj: any, field: string|string[]) => Promise<boolean>) {
    super()
    this.isExists = isExists
  }

  async validate(obj: any, field: string|string[]): Promise<Misfit|undefined> {
    if (this.isFieldAbsent(obj, field)) {
      return
    }

    if (! await this.isExists(obj, field)) {
      return new Misfit
    }
  }
}