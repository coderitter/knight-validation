import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export class QuickConstraint<T = any> extends Constraint<T, any> {

  validateFn: (obj: T, properties: string|string[]) => Promise<Misfit|null>

  constructor(name: string, validate: (obj: T, property: string|string[]) => Promise<Misfit|null>) {
    super()

    this.name = name
    this.validateFn = validate
  }

  async validate(obj: T, properties: string|string[]): Promise<Misfit|null> {
    return this.validateFn(obj, properties)
  }
}
