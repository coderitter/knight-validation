import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export interface AbsentMisfitValues {
  actual: any
}

export class Absent extends Constraint<AbsentMisfitValues> {

  async validate(obj: any, field: string|string[]): Promise<Misfit<AbsentMisfitValues>|undefined> {
    return this.defaultValidation(obj, field, async (value: any) => {
      if (value !== undefined) {
        return new Misfit('Absent', field, { actual: value })
      }
    })
  }
}
