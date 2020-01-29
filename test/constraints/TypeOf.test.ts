import { expect } from 'chai'
import 'mocha'
import { Misfit } from '../../src'
import TypeOf from '../../src/lib/constraints/TypeOf'

describe('constraints', function() {
  describe('TypeOf', function() {
    describe('validate', function() {
      it('should return undefined if correct type', async function() {
        let typeOf = new TypeOf('number')
        let misfit = await typeOf.validate(1)
        expect(misfit).to.be.undefined
      })

      it('should return a misfit if wrong type', async function() {
        let typeOf = new TypeOf('number')
        let misfit = await typeOf.validate('1')
        expect(misfit).to.be.instanceOf(Misfit)
      })

      it('should return a undefined the value is undefined', async function() {
        let typeOf = new TypeOf('number')
        let misfit = await typeOf.validate(undefined)
        expect(misfit).to.be.undefined
      })
    })
  })
})
