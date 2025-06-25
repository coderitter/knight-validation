import { Misfit } from 'knight-misfit'
import { Constraint } from '../Constraint'

export class QuickConstraint<T> extends Constraint<T, any> {

  name: string
  validateFn?: (obj: T) => Promise<Misfit|null>
  validateMultiplePropertiesFn?: (obj: T, properties: string[]) => Promise<Misfit|null>

  constructor(
    name: string, 
    validateFn?: (obj: T) => Promise<Misfit|null>,
    validateMultiplePropertiesFn?: (obj: T, properties: string[]) => Promise<Misfit|null>
  ) {
    super()
    this.name = name
    this.validateFn = validateFn
    this.validateMultiplePropertiesFn = validateMultiplePropertiesFn
  }

  async validate(obj: T): Promise<Misfit|null> {
    if (this.validateFn == undefined) {
      throw new Error('Could not call method because the needed this.validateFn function was not set!')
    }

    return this.validateFn(obj)
  }

  async validateMultipleProperties(obj: T, properties: string[]): Promise<Misfit|null> {
    if (this.validateMultiplePropertiesFn == undefined) {
      return super.validateMultipleProperties(obj, properties)
    }
    
    return this.validateMultiplePropertiesFn(obj, properties)
  }
}
