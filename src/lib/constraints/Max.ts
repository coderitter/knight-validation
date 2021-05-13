import Constraint from '../Constraint'
import Misfit from '../Misfit'

export default class Max extends Constraint {

  max: number

  constructor(max: number) {
    super()
    this.max = max
  }

  async validate(obj: any, field: string|string[]): Promise<Misfit|undefined> {
    return this.defaultValidation(obj, field, async value => {
      if (typeof value == 'number') {
        return value > this.max ? new Misfit : undefined
      }

      if (typeof value == 'string') {
        return value.length > this.max ? new Misfit : undefined
      }

      if (value instanceof Array) {
        return value.length > this.max ? new Misfit : undefined
      }
    })
  }
}