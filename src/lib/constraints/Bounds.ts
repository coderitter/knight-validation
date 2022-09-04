import Constraint from '../Constraint'
import Misfit from '../Misfit'

export default class Bounds extends Constraint {

  greaterThan?: number
  greaterThanEqual?: number
  lesserThan?: number
  lesserThanEqual?: number

  constructor(constraints: Partial<Bounds>) {
    super()
    Object.assign(this, constraints)
  }

  async validate(obj: any, field: string|string[]): Promise<Misfit|undefined> {
    return this.defaultValidation(obj, field, async value => {
      if (typeof value == 'number' && ! isNaN(value)) {
        if (this.lesserThan != undefined && value >= this.lesserThan) {
          return new Misfit('Bounds', field, { ...this, actual: value })
        }
        
        if (this.lesserThanEqual != undefined && value > this.lesserThanEqual) {
          return new Misfit('Bounds', field, { ...this, actual: value })
        }
        
        if (this.greaterThan != undefined && value <= this.greaterThan) {
          return new Misfit('Bounds', field, { ...this, actual: value })
        }

        if (this.greaterThanEqual != undefined && value < this.greaterThanEqual) {
          return new Misfit('Bounds', field, { ...this, actual: value })
        }
      }
    })
  }
}