import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export interface UniqueMisfitValues {
  notUniqueValue: any
}

export class Unique<T = any> extends Constraint<T, UniqueMisfitValues> {

  isUnique: (obj: T, property: string|string[]) => Promise<boolean>

  constructor(isUnique: (obj: T, property: string|string[]) => Promise<boolean>) {
    super()
    this.isUnique = isUnique
  }

  async validate(obj: T, property: string|string[]): Promise<Misfit<UniqueMisfitValues>|null> {
    return this.defaultValidation(obj, property, async (value: any) => {
      if (! await this.isUnique(obj, property)) {
        return new Misfit(this.name, property, { notUniqueValue: value })
      }

      return null
    })
  }
}
