import { Constraint, ConstraintMisfitValues } from '../Constraint'
import { Misfit } from '../Misfit'

export interface BoundsMisfitValues extends ConstraintMisfitValues {
  actual: any
  greaterThan?: number
  greaterThanEqual?: number
  lesserThan?: number
  lesserThanEqual?: number
}

export class Bounds extends Constraint<any, BoundsMisfitValues> {

  greaterThan?: number
  greaterThanEqual?: number
  lesserThan?: number
  lesserThanEqual?: number

  constructor(constraints: Partial<Bounds>) {
    super()
    Object.assign(this, constraints)
  }

  async validate(value: any): Promise<Misfit<BoundsMisfitValues>|null> {
    if (typeof value != 'number' || isNaN(value)) {
      return null
    }

    if (this.lesserThan != undefined && value >= this.lesserThan) {
      return this._createMisfit(value)
    }
    
    else if (this.lesserThanEqual != undefined && value > this.lesserThanEqual) {
      return this._createMisfit(value)
    }
    
    else if (this.greaterThan != undefined && value <= this.greaterThan) {
      return this._createMisfit(value)
    }

    else if (this.greaterThanEqual != undefined && value < this.greaterThanEqual) {
      return this._createMisfit(value)
    }

    return null
  }

  private _createMisfit(actual: any): Misfit<BoundsMisfitValues> {
    return new Misfit<BoundsMisfitValues>(this.name, {
      actual: actual,
      greaterThan: this.greaterThan,
      greaterThanEqual: this.greaterThanEqual,
      lesserThan: this.lesserThan,
      lesserThanEqual: this.lesserThanEqual
    })
  }
}