import { expect } from 'chai'
import 'mocha'
import { Misfit } from '../../src'
import TypeOf, { TypeOfConstraints } from '../../src/lib/constraints/TypeOf'

describe('constraints', function() {
  describe('TypeOf', function() {
    describe('validate', function() {
      it('should return undefined if correct type', async function() {
        let typeOf = new TypeOf('number')
        let misfit = await typeOf.validate(1)
        expect(misfit).to.be.undefined
      })

      it('should return a undefined the value is undefined', async function() {
        let typeOf = new TypeOf('number')

        expect(await typeOf.validate(undefined)).to.be.undefined
        expect(await typeOf.validate(null)).to.be.undefined
        expect(await typeOf.validate('')).to.be.undefined
        expect(await typeOf.validate(NaN)).to.be.undefined
        expect(await typeOf.validate({})).to.be.undefined
      })

      it('should return a misfit if wrong type', async function() {
        let typeOf = new TypeOf('number')
        let misfit = await typeOf.validate('1')
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.constraints).to.deep.equal(<TypeOfConstraints> { type: 'number' })
      })
    })
  })
})
