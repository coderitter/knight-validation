import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export class Length extends Constraint {

  min?: number
  max?: number
  exact?: number

  constructor(constraints: Partial<Length>) {
    super()
    Object.assign(this, constraints)
  }

  async validate(obj: any, field: string|string[]): Promise<Misfit|undefined> {
    return this.defaultValidation(obj, field, async value => {
      if (typeof value == 'string' || value instanceof Array) {
        if (this.min != undefined && value.length < this.min) {
          return new Misfit('Length', field, { ...this, actual: value.length })
        }

        if (this.max != undefined && value.length > this.max) {
          return new Misfit('Length', field, { ...this, actual: value.length })
        }

        if (this.exact != undefined && value.length != this.exact) {
          return new Misfit('Length', field, { ...this, actual: value.length })
        }
      }
    })
  }
}