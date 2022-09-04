import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export interface UniqueMisfitValues {
  notUniqueValue: any
}

export class Unique extends Constraint<any, UniqueMisfitValues> {

  isUnique: (value: any) => Promise<boolean>

  constructor(isUnique: (value: any) => Promise<boolean>) {
    super()
    this.isUnique = isUnique
  }

  async validate(value: any): Promise<Misfit<UniqueMisfitValues>|null> {
    if (value === undefined) {
      return null
    }

    if (! await this.isUnique(value)) {
      return new Misfit(this.name, { notUniqueValue: value })
    }

    return null
  }
}
