export default class Misfit {

  code: string
  field?: string
  message?: string

  constructor(fieldOrCode: string, code?: string) {
    if (code == undefined) {
      this.code = fieldOrCode
    }
    else {
      this.field = fieldOrCode
      this.code = code
    }
  }

  setMessage(message: string|undefined): this {
    this.message = message
    return this
  }

  static missing(field: string, message?: string) {
    return new Misfit(field, 'Missing').setMessage(message)
  }

  static notFound(field: string, message?: string) {
    return new Misfit(field, 'NotFound').setMessage(message)
  }
}
