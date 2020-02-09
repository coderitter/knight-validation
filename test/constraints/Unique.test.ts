import { expect } from 'chai'
import 'mocha'
import { Misfit } from '../../src'
import Unique from '../../src/lib/constraints/Unique'

describe('constraints', function() {
  describe('Unqiue', function() {
    describe('validate', function() {
      it('should return undefined if unique', async function() {
        let unique = new Unique(async (value: number) => value === 1)
        let misfit = await unique.validate(1)
        expect(misfit).to.be.undefined
      })

      it('should return undefined if the value is undefined', async function() {
        let unique = new Unique(async (value: number) => value === 1)

        expect(await unique.validate(undefined)).to.be.undefined
        expect(await unique.validate(null)).to.be.undefined
        expect(await unique.validate('')).to.be.undefined
        expect(await unique.validate(NaN)).to.be.undefined
        expect(await unique.validate({})).to.be.undefined
      })

      it('should return a misfit if not unique', async function() {
        let unique = new Unique(async (value: number) => value === 1)
        let misfit = await unique.validate(2)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.type).to.equal('Unique')
      })
    })
  })
})
