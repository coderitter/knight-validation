import { Constraint, ConstraintMisfitValues } from '../Constraint'
import { Misfit } from '../Misfit'

export interface AbsentMisfitValues extends ConstraintMisfitValues {
  actual: any
}

export class Absent extends Constraint<any, AbsentMisfitValues> {
  async validate(value: any): Promise<Misfit<AbsentMisfitValues>|null> {
    return value !== undefined ? new Misfit(this.name, { actual: value }) : null
  }
}
