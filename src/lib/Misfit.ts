export class Misfit<ValuesType = any> {

  constraint!: string
  properties: string[] = []
  values?: ValuesType
  message?: string

  constructor(name?: string, properties?: string|string[], values?: ValuesType, message?: string) {
    this.constraint = <any> name
    
    if (typeof properties == 'string') {
      this.properties = [ properties ]
    }
    else if (properties instanceof Array) {
      this.properties = properties
    }

    this.values = values
    this.message = message
  }

  setProperties(property: string|string[]) {
    if (typeof property == 'string') {
      this.properties = [ property ]
    }
    else if (property instanceof Array) {
      this.properties = property
    }
  }

  addPrefix(prefix: string) {
    for (let i = 0; i < this.properties.length; i++) {
      this.properties[i] = prefix + this.properties[i]
    }
  }

  isSinglePropery(): boolean {
    return this.properties && this.properties.length == 1
  }

  isMultipleProperties(): boolean {
    return this.properties && this.properties.length > 1
  }
}
