export class Misfit<ValuesType = any> {

  constraint!: string
  properties: string[] = []
  values?: ValuesType
  message?: string

  constructor(constraint?: string, values?: ValuesType) {
    this.constraint = <any> constraint
    this.values = values
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

  isSingleProperty(): boolean {
    return this.properties && this.properties.length == 1
  }

  isMultipleProperties(): boolean {
    return this.properties && this.properties.length > 1
  }
}
