import { fieldsEqual } from './fieldsEqual'

export class Misfit<ValuesType = any> {

  constraint!: string
  field!: string
  fields!: string[]
  values?: ValuesType
  message?: string

  constructor(name?: string, field?: string|string[], values?: ValuesType, message?: string) {
    this.constraint = <any> name
    
    if (typeof field == 'string') {
      this.field = field
    }
    else if (field instanceof Array) {
      this.fields = field
    }

    this.values = values
    this.message = message
  }

  setField(field: string|string[]) {
    if (typeof field == 'string') {
      this.field = field
    }
    else if (field instanceof Array) {
      this.fields = field
    }
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
}
