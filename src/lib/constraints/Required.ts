import { Misfit } from 'knight-misfit'
import { Constraint, ConstraintMisfitValues } from '../Constraint'

export class Required extends Constraint {
  async validate(value: any): Promise<Misfit<ConstraintMisfitValues>|null> {
    return value === undefined ? new Misfit(this.name) : null
  }
}