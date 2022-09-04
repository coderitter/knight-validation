import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export interface AbsentMisfitValues {
  actual: any
}

export class Absent<T = any> extends Constraint<T, AbsentMisfitValues> {

  async validate(obj: T, properties: string|string[]): Promise<Misfit<AbsentMisfitValues>|null> {
    return this.defaultValidation(obj, properties, async (value: any) => {
      if (value !== undefined) {
        return new Misfit('Absent', properties, { actual: value })
      }

      return null
    })
  }
}
