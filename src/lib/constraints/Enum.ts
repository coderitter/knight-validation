import Constraint from '../Constraint'
import Misfit from '../Misfit'

export default class Enum extends Constraint {

  enum: any[]

  constructor(enumValues: any[]) {
    super()
    this.enum = enumValues
  }

  async validate(obj: any, field: string|string[]): Promise<Misfit|undefined> {
    return this.defaultValidation(obj, field, async (value: any) => {
      if (this.enum.indexOf(value) == -1) {
        return new Misfit
      }
    })
  }
}