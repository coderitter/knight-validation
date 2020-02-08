import Misfit from './Misfit'

export default abstract class Constraint {

  type: string = this.constructor.name
  
  abstract validate(value: any, obj?: any): Promise<Misfit|undefined>
}