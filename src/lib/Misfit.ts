import { Absent } from './constraints/Absent'
import { Bounds } from './constraints/Bounds'
import { Exists } from './constraints/Exists'
import { Length } from './constraints/Length'
import { Required } from './constraints/Required'
import { TypeOf } from './constraints/TypeOf'
import { Unique } from './constraints/Unique'
import { fieldsEqual } from './fieldsEqual'

export class Misfit {

  name!: string
  field!: string
  fields!: string[]
  constraints?: any
  message?: string

  constructor(name?: string, field?: string|string[], constraints?: object, message?: string) {
    this.name = <any> name
    
    if (typeof field == 'string') {
      this.field = field
    }
    else if (field instanceof Array) {
      this.fields = field
    }

    this.constraints = constraints
    this.message = message
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

  fieldsEqual(fields: string[]): boolean {
    return fieldsEqual(this.fields, fields)
  }

  static required(field: string, message?: string) {
    return new Misfit(Required.name, field).setMessage(message)
  }

  static bounds(field: string, message?: string) {
    return new Misfit(Bounds.name, field).setMessage(message)
  }

  static length_(field: string, message?: string) {
    return new Misfit(Length.name, field).setMessage(message)
  }

  static absent(field: string, message?: string) {
    return new Misfit(Absent.name, field).setMessage(message)
  }

  static unique(field: string, message?: string) {
    return new Misfit(Unique.name, field).setMessage(message)
  }

  static exists(field: string, message?: string) {
    return new Misfit(Exists.name, field).setMessage(message)
  }

  static typeOf(field: string, message?: string) {
    return new Misfit(TypeOf.name, field).setMessage(message)
  }
}
