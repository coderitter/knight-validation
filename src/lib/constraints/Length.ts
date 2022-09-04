import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export interface LengthMisfitValues {
  actual: any
  min?: number
  max?: number
  exact?: number
}

export class Length<T = any> extends Constraint<T, LengthMisfitValues> {

  min?: number
  max?: number
  exact?: number

  constructor(constraints: Partial<Length>) {
    super()
    Object.assign(this, constraints)
  }

  async validate(obj: T, properties: string|string[]): Promise<Misfit<LengthMisfitValues>|null> {
    return this.defaultValidation(obj, properties, async value => {
      if (typeof value == 'string' || value instanceof Array) {
        if (this.min != undefined && value.length < this.min) {
          return this._createMisfit(properties, value.length)
        }

        else if (this.max != undefined && value.length > this.max) {
          return this._createMisfit(properties, value.length)
        }

        else if (this.exact != undefined && value.length != this.exact) {
          return this._createMisfit(properties, value.length)
        }
      }

      return null
    })
  }

  private _createMisfit(properties: string|string[], actual: any): Misfit<LengthMisfitValues> {
    return new Misfit<LengthMisfitValues>(this.name, properties, {
      actual: actual,
      exact: this.exact,
      max: this.max,
      min: this.min
    })
  }
}
