import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export interface LengthMisfitValues {
  actual: any
  min?: number
  max?: number
  exact?: number
}

export class Length extends Constraint<any, LengthMisfitValues> {

  min?: number
  max?: number
  exact?: number

  constructor(constraints: Partial<Length>) {
    super()
    Object.assign(this, constraints)
  }

  async validate(value: any): Promise<Misfit<LengthMisfitValues>|null> {
    if (typeof value != 'string' && ! (value instanceof Array)) {
      return null
    }

    if (this.min != undefined && value.length < this.min) {
      return this._createMisfit(value.length)
    }

    else if (this.max != undefined && value.length > this.max) {
      return this._createMisfit(value.length)
    }

    else if (this.exact != undefined && value.length != this.exact) {
      return this._createMisfit(value.length)
    }

    return null
  }

  private _createMisfit(actual: any): Misfit<LengthMisfitValues> {
    return new Misfit<LengthMisfitValues>(this.name, {
      actual: actual,
      exact: this.exact,
      max: this.max,
      min: this.min
    })
  }
}
