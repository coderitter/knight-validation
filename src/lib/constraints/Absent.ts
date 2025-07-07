import { Misfit } from 'knight-misfit'
import { Constraint, ConstraintMisfitValues } from '../Constraint'

export interface AbsentMisfitValues extends ConstraintMisfitValues {
  actual: any
}

export class Absent extends Constraint<any, AbsentMisfitValues> {

  constructor(constraints?: Partial<Absent>) {
    super()
    Object.assign(this, constraints)
  }

  async validate(value: any): Promise<Misfit<AbsentMisfitValues>|null> {
    return value !== undefined ? new Misfit(this.name, undefined, { actual: value }) : null
  }
}
