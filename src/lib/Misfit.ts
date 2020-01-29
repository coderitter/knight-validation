import { Exists } from '..'
import Required from './constraints/Required'
import TypeOf from './constraints/TypeOf'
import Unique from './constraints/Unique'

export default class Misfit {

  name!: string
  field?: string
  message?: string
  constraints!: any

  constructor(fieldOrName?: string, nameOrConstraints?: string|object, constraints?: object) {
    if (typeof nameOrConstraints == 'string' && constraints != undefined) {
      this.field = fieldOrName
      this.name = nameOrConstraints
      this.constraints = constraints
    }
    else if (typeof fieldOrName == 'string' && typeof nameOrConstraints == 'object') {
      this.name = fieldOrName
      this.constraints = nameOrConstraints
    }
    else if (typeof fieldOrName == 'string' && typeof nameOrConstraints == 'string') {
      this.field = fieldOrName
      this.name = nameOrConstraints
    }
    else if (typeof fieldOrName == 'string') {
      this.name = fieldOrName
    }
  }

  setMessage(message: string|undefined): this {
    this.message = message
    return this
  }

  static required(field: string, message?: string) {
    return new Misfit(field, Required.name).setMessage(message)
  }

  static unique(field: string, message?: string) {
    return new Misfit(field, Unique.name).setMessage(message)
  }

  static exists(field: string, message?: string) {
    return new Misfit(field, Exists.name).setMessage(message)
  }

  static typeOf(field: string, message?: string) {
    return new Misfit(field, TypeOf.name).setMessage(message)
  }
}
