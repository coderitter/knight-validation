import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export interface BoundsMisfitValues {
  actual: any
  greaterThan?: number
  greaterThanEqual?: number
  lesserThan?: number
  lesserThanEqual?: number
}

export class Bounds<T = any> extends Constraint<T, BoundsMisfitValues> {

  greaterThan?: number
  greaterThanEqual?: number
  lesserThan?: number
  lesserThanEqual?: number

  constructor(constraints: Partial<Bounds<T>>) {
    super()
    Object.assign(this, constraints)
  }

  async validate(obj: T, properties: string|string[]): Promise<Misfit<BoundsMisfitValues>|null> {
    return this.defaultValidation(obj, properties, async value => {
      if (typeof value == 'number' && ! isNaN(value)) {
        if (this.lesserThan != undefined && value >= this.lesserThan) {
          return this._createMisfit(properties, value)
        }
        
        else if (this.lesserThanEqual != undefined && value > this.lesserThanEqual) {
          return this._createMisfit(properties, value)
        }
        
        else if (this.greaterThan != undefined && value <= this.greaterThan) {
          return this._createMisfit(properties, value)
        }

        else if (this.greaterThanEqual != undefined && value < this.greaterThanEqual) {
          return this._createMisfit(properties, value)
        }
      }

      return null
    })
  }

  private _createMisfit(properties: string|string[], actual: any): Misfit<BoundsMisfitValues> {
    return new Misfit<BoundsMisfitValues>(this.name, properties, {
      actual: actual,
      greaterThan: this.greaterThan,
      greaterThanEqual: this.greaterThanEqual,
      lesserThan: this.lesserThan,
      lesserThanEqual: this.lesserThanEqual
    })
  }
}