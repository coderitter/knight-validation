import Constraint from '../Constraint'
import Misfit from '../Misfit'

export default class Enum extends Constraint {

  values: any[]

  constructor(values: any[])
  constructor(...values: any[])

  constructor(...values: any) {
    super()

    if (values instanceof Array && values.length == 1 && values[0] instanceof Array) {
      this.values = values[0]
    }
    else {
      this.values = values
    }
  }

  async validate(obj: any, field: string|string[]): Promise<Misfit|undefined> {
    return this.defaultValidation(obj, field, async (value: any) => {
      if (this.values.indexOf(value) == -1) {
        return new Misfit
      }
    })
  }
}