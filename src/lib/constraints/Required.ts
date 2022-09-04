import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export class Required<T = any> extends Constraint<T, void> {

  async validate(obj: T, properties: string|string[]): Promise<Misfit<void>|null> {
    return this.defaultValidation(obj, properties, async (value: any) => {
      if (value === undefined) {
        return new Misfit
      }

      return null
    }, false)
  }
}