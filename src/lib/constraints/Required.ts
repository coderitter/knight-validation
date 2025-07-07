import { Misfit } from 'knight-misfit'
import { Constraint, ConstraintMisfitValues } from '../Constraint'

export class Required extends Constraint {

  constructor(constraints?: Partial<Required>) {
    super()
    Object.assign(this, constraints)
  }

  async validate(value: any): Promise<Misfit<ConstraintMisfitValues>|null> {
    return value === undefined ? new Misfit(this.name) : null
  }
}