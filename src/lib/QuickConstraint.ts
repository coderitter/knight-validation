import { Constraint } from './Constraint'
import { Misfit } from './Misfit'

export class QuickConstraint<T> extends Constraint<T, any> {

  name: string
  validateFn: (obj: T) => Promise<Misfit|null>

  constructor(name: string, validateFn: (obj: T) => Promise<Misfit|null>) {
    super()
    this.name = name
    this.validateFn = validateFn
  }

  async validate(obj: T): Promise<Misfit|null> {
    return this.validateFn(obj)
  }
}
