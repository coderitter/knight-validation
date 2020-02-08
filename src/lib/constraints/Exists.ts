import Constraint from '../Constraint'
import Misfit from '../Misfit'

export default class Exists extends Constraint {

  isExists: (value: any, obj: any) => Promise<boolean>

  constructor(isExists: (value: any, obj: any) => Promise<boolean>) {
    super()
    this.isExists = isExists
  }

  async validate(value: any, obj?: any): Promise<Misfit|undefined> {
    if (value === undefined) {
      return undefined
    }

    if (! await this.isExists(value, obj)) {
      return new Misfit(this.type)
    }
  }
}