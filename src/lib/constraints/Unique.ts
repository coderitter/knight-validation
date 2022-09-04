import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export interface UniqueMisfitValues {
  notUniqueValue: any
}

export class Unique<T = any> extends Constraint<T, UniqueMisfitValues> {

  isUnique: (obj: T, properties: string|string[]) => Promise<boolean>

  constructor(isUnique: (obj: T, properties: string|string[]) => Promise<boolean>) {
    super()
    this.isUnique = isUnique
  }

  async validate(obj: T, properties: string|string[]): Promise<Misfit<UniqueMisfitValues>|null> {
    return this.defaultValidation(obj, properties, async (value: any) => {
      if (! await this.isUnique(obj, properties)) {
        return new Misfit(this.name, properties, { notUniqueValue: value })
      }

      return null
    })
  }
}
