import { Misfit } from 'knight-misfit'
import { Constraint, ConstraintMisfitValues } from '../Constraint'

export interface UniqueMisfitValues extends ConstraintMisfitValues {
  notUniqueValue: any
}

export class Unique<T> extends Constraint<T, UniqueMisfitValues> {

  isUnique: (value: T) => Promise<boolean>

  constructor(isUnique: (value: T) => Promise<boolean>) {
    super()
    this.isUnique = isUnique
  }

  async validate(value: T): Promise<Misfit<UniqueMisfitValues>|null> {
    if (value === undefined) {
      return null
    }

    if (! await this.isUnique(value)) {
      return new Misfit(this.name, undefined, { notUniqueValue: value })
    }

    return null
  }
}
