import { Misfit } from './Misfit'

export abstract class Constraint<T = any, MisfitValuesType = any> {
  name: string = this.constructor.name
  abstract validate(value: T): Promise<Misfit<MisfitValuesType>|null>
}
