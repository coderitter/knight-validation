import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export interface BoundsMisfitValues {
  actual: any
  greaterThan?: number
  greaterThanEqual?: number
  lesserThan?: number
  lesserThanEqual?: number
}

export class Bounds extends Constraint<BoundsMisfitValues> {

  greaterThan?: number
  greaterThanEqual?: number
  lesserThan?: number
  lesserThanEqual?: number

  constructor(constraints: Partial<Bounds>) {
    super()
    Object.assign(this, constraints)
  }

  async validate(obj: any, field: string|string[]): Promise<Misfit<BoundsMisfitValues>|undefined> {
    return this.defaultValidation(obj, field, async value => {
      let misfit

      if (typeof value == 'number' && ! isNaN(value)) {
        if (this.lesserThan != undefined && value >= this.lesserThan) {
          return this._createMisfit(field, value)
        }
        
        else if (this.lesserThanEqual != undefined && value > this.lesserThanEqual) {
          return this._createMisfit(field, value)
        }
        
        else if (this.greaterThan != undefined && value <= this.greaterThan) {
          return this._createMisfit(field, value)
        }

        else if (this.greaterThanEqual != undefined && value < this.greaterThanEqual) {
          return this._createMisfit(field, value)
        }
      }
    })
  }

  private _createMisfit(field: string|string[], actual: any): Misfit<BoundsMisfitValues> {
    return new Misfit<BoundsMisfitValues>(this.name, field, {
      actual: actual,
      greaterThan: this.greaterThan,
      greaterThanEqual: this.greaterThanEqual,
      lesserThan: this.lesserThan,
      lesserThanEqual: this.lesserThanEqual
    })
  }
}