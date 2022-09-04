import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export interface UniqueMisfitValues {
  notUniqueValue: any
}

export class Unique<T = any> extends Constraint<T, UniqueMisfitValues> {

  isUnique: (obj: T, field: string|string[]) => Promise<boolean>

  constructor(isUnique: (obj: T, field: string|string[]) => Promise<boolean>) {
    super()
    this.isUnique = isUnique
  }

  async validate(obj: T, field: string|string[]): Promise<Misfit<UniqueMisfitValues>|undefined> {
    return this.defaultValidation(obj, field, async (value: any) => {
      if (! await this.isUnique(obj, field)) {
        return new Misfit(this.name, field, { notUniqueValue: value })
      }  
    })
  }
}
