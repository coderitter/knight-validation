import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export class Absent extends Constraint {

  async validate(obj: any, field: string|string[]): Promise<Misfit|undefined> {
    return this.defaultValidation(obj, field, async (value: any) => {
      if (value !== undefined) {
        return new Misfit
      }
    })
  }
}
