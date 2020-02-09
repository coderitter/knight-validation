import { expect } from 'chai'
import 'mocha'
import { Misfit } from '../../src'
import Exists from '../../src/lib/constraints/Exists'

describe('constraints', function() {
  describe('Exists', function() {
    describe('validate', function() {
      it('should return undefined if exists', async function() {
        let exists = new Exists(async (value: number) => value === 1)
        let misfit = await exists.validate(1)
        expect(misfit).to.be.undefined
      })

      it('should return undefined if the value is missing', async function() {
        let exists = new Exists(async (value: number) => value === 1)

        expect(await exists.validate(undefined)).to.be.undefined
        expect(await exists.validate(null)).to.be.undefined
        expect(await exists.validate('')).to.be.undefined
        expect(await exists.validate(NaN)).to.be.undefined
      })

      it('should return a misfit if not exists', async function() {
        let exists = new Exists(async (value: number) => value === 1)
        let misfit = await exists.validate(2)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.type).to.equal('Exists')
      })
    })
  })
})
