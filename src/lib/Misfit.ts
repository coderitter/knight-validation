import { Exists } from '..'
import Required from './constraints/Required'
import TypeOf from './constraints/TypeOf'
import Unique from './constraints/Unique'

export default class Misfit {

  name!: string
  field!: string
  fields!: string[]
  constraints?: any
  message?: string

  constructor(name?: string, field?: string|string[], constraints?: object) {
    this.name = <any> name
    
    if (typeof field == 'string') {
      this.field = field
    }
    else if (field instanceof Array) {
      this.fields = field
    }

    this.constraints = constraints
  }

  setMessage(message: string|undefined): this {
    this.message = message
    return this
  }

  isSingleField(): boolean {
    return this.field != undefined
  }

  isFieldCombination(): boolean {
    return this.fields != undefined
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
