export default class Mismatch {

  field: string
  code: string
  message: string

  constructor(field: string, code: string, message: string) {
    this.field = field
    this.code = code
    this.message = message
  }

  static missing(field: string) {
    return new Mismatch(field, 'Missing', '')
  }

  static notFound(field: string) {
    return new Mismatch(field, 'NotFound', '')
  }
}
