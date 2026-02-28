import { Misfit } from 'knight-misfit'
import { Constraint, ConstraintMisfitValues } from '../Constraint'

export interface ExistsMisfitValues extends ConstraintMisfitValues {
  notExistingValue: any
}

export class Exists<T> extends Constraint<T, ExistsMisfitValues> {

  doesExist: (value: T) => Promise<boolean>

  constructor(doesExist: (value: T) => Promise<boolean>, constraints?: Partial<Constraint>) {
    super(Exists.name)
    Object.assign(this, constraints)
    this.doesExist = doesExist
  }

  async validate(value: T): Promise<Misfit<ExistsMisfitValues>|null> {
    if (value !== undefined) {
      if (! await this.doesExist(value)) {
        return new Misfit(this.name, undefined, {
          notExistingValue: value
        })
      }  
    }

    return null
  }
}
