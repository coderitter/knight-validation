import { Constraint, ConstraintMisfitValues } from '../Constraint'
import { Misfit } from '../Misfit'

export class Required extends Constraint {
  async validate(value: any): Promise<Misfit<ConstraintMisfitValues>|null> {
    return value === undefined ? new Misfit(this.name) : null
  }
}