import Constraint from './Constraint'
import { Misfit } from '..'

export default class QuickConstraint extends Constraint {

  validateFn: (value: any, obj: any) => Promise<Misfit|undefined>

  constructor(name: string, validate: (value: any, obj: any) => Promise<Misfit|undefined>) {
    super()

    this.name = name
    this.validateFn = validate
  }

  async validate(value: any, obj: any): Promise<Misfit|undefined> {
    let result = await this.validateFn(value, obj)

    if (result instanceof Misfit) {
      if (result.name == undefined) {
        result.name = this.name
      }
    }
    
    return result
  }
}