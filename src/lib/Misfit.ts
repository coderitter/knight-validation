export class Misfit<ValuesType = any> {

  constraint!: string
  property!: string
  properties!: string[]
  values?: ValuesType
  message?: string

  constructor(name?: string, properties?: string|string[], values?: ValuesType, message?: string) {
    this.constraint = <any> name
    
    if (typeof properties == 'string') {
      this.property = properties
    }
    else if (properties instanceof Array) {
      this.properties = properties
    }

    this.values = values
    this.message = message
  }

  setProperties(property: string|string[]) {
    if (typeof property == 'string') {
      this.property = property
    }
    else if (property instanceof Array) {
      this.properties = property
    }
  }

  isSinglePropery(): boolean {
    return this.property != undefined
  }

  isMultipleProperties(): boolean {
    return this.properties != undefined
  }
}
