import { Constraint } from '../Constraint'
import { Misfit } from '../Misfit'

export class QuickConstraint extends Constraint<any> {

  validateFn: (obj: any, field: string|string[]) => Promise<Misfit|undefined>

  constructor(name: string, validate: (obj: any, field: string|string[]) => Promise<Misfit|undefined>) {
    super()

    this.name = name
    this.validateFn = validate
  }

  async validate(obj: any, field: string|string[]): Promise<Misfit|undefined> {
    return this.validateFn(obj, field)
  }
}
