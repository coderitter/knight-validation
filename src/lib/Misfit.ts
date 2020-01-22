export default class Misfit {

  field?: string
  code: string
  message: string

  constructor(fieldOrCode: string, codeOrMessage: string, message?: string) {
    if (message != undefined) {
      this.field = fieldOrCode
      this.code = codeOrMessage
      this.message = message
    }
    else {
      this.code = fieldOrCode
      this.message = codeOrMessage
    }
  }

  static missing(field: string) {
    return new Misfit(field, 'Missing', '')
  }

  static notFound(field: string) {
    return new Misfit(field, 'NotFound', '')
  }
}
