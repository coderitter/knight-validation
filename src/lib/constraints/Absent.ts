import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export interface AbsentMisfitValues {
  actual: any
}

export class Absent<T = any> extends Constraint<T, AbsentMisfitValues> {

  async validate(obj: T, field: string|string[]): Promise<Misfit<AbsentMisfitValues>|undefined> {
    return this.defaultValidation(obj, field, async (value: any) => {
      if (value !== undefined) {
        return new Misfit('Absent', field, { actual: value })
      }
    })
  }
}
