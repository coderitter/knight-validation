import Constraint from '../Constraint'
import Misfit from '../Misfit'

export default class Length extends Constraint {

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
          return new Misfit('Length', field, { ...this, actual: value.length }, `Length of '${field}' is less than ${this.min}`)
        }

        if (this.max != undefined && value.length > this.max) {
          return new Misfit('Length', field, { ...this, actual: value.length }, `Length of '${field}' is greater than ${this.max}`)
        }

        if (this.exact != undefined && value.length != this.exact) {
          return new Misfit('Length', field, { ...this, actual: value.length }, `Length of '${field}' is not exact ${this.exact}`)
        }
      }
    })
  }
}