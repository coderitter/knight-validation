import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export class Required<T = any> extends Constraint<T, void> {

  async validate(obj: T, field: string|string[]): Promise<Misfit<void>|undefined> {
    return this.defaultValidation(obj, field, async (value: any) => {
      if (value === undefined) {
        return new Misfit
      }
    }, false)
  }
}