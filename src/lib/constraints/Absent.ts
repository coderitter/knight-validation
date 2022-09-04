import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export interface AbsentMisfitValues {
  actual: any
}

export class Absent<T = any> extends Constraint<T, AbsentMisfitValues> {

  async validate(obj: T, property: string|string[]): Promise<Misfit<AbsentMisfitValues>|null> {
    return this.defaultValidation(obj, property, async (value: any) => {
      if (value !== undefined) {
        return new Misfit('Absent', property, { actual: value })
      }

      return null
    })
  }
}
