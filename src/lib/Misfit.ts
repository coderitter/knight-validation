import Absent from './constraints/Absent'
import Exists from './constraints/Exists'
import Required from './constraints/Required'
import TypeOf from './constraints/TypeOf'
import Unique from './constraints/Unique'
import fieldsEqual from './fieldsEqual'

export default class Misfit {

  constraint!: string
  field!: string
  fields!: string[]
  values?: any
  message?: string

  constructor(constraint?: string, field?: string|string[], values?: any) {
    this.constraint = <any> constraint
    
    if (typeof field == 'string') {
      this.field = field
    }
    else if (field instanceof Array) {
      this.fields = field
    }

    this.values = values
  }

  setMessage(message: string|undefined): this {
    this.message = message
    return this
  }

  isSingleField(): boolean {
    return this.field != undefined
  }

  isMultipleField(): boolean {
    return this.fields != undefined
  }

  fieldsEqual(fields: string[]): boolean {
    return fieldsEqual(this.fields, fields)
  }

  static required(field: string, message?: string) {
    return new Misfit(Required.name, field).setMessage(message)
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
