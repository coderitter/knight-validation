import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export class QuickConstraint<T = any> extends Constraint<T, any> {

  validateFn: (obj: T, property: string|string[]) => Promise<Misfit|undefined>

  constructor(name: string, validate: (obj: T, property: string|string[]) => Promise<Misfit|undefined>) {
    super()

    this.name = name
    this.validateFn = validate
  }

  async validate(obj: T, property: string|string[]): Promise<Misfit|undefined> {
    return this.validateFn(obj, property)
  }
}
