import { expect } from 'chai'
import { Misfit } from 'knight-misfit'
import 'mocha'
import { Exists } from '../../src'

describe('constraints', function () {
  describe('Exists', function () {
    describe('constructor', function() {
      it('should set all possible constraints', function() {
        let exists = new Exists(async () => true, { minFits: 1, maxFits: 2, exactFits: 3 })
        expect(exists.minFits).to.equal(1)
        expect(exists.maxFits).to.equal(2)
        expect(exists.exactFits).to.equal(3)
      })
    })

    describe('validate', function () {
      it('should return undefined if exists', async function () {
        let exists = new Exists(async (value: any) => value === 1)
        let misfit = await exists.validate(1)
        expect(misfit).to.be.null
      })

      it('should return undefined if the value is missing', async function () {
        let exists = new Exists(async (value: any) => value === 1)

        expect(await exists.validate(undefined)).to.be.null
      })

      it('should return a misfit if not exists', async function () {
        let exists = new Exists(async (value: any) => value === 1)
        expect(await exists.validate(2)).to.be.instanceOf(Misfit)
        expect(await exists.validate(null)).to.be.instanceOf(Misfit)
        expect(await exists.validate('')).to.be.instanceOf(Misfit)
        expect(await exists.validate(NaN)).to.be.instanceOf(Misfit)
      })
    })
  })
})
