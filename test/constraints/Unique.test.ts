import { expect } from 'chai'
import { Misfit } from 'knight-misfit'
import 'mocha'
import { Unique } from '../../src'

describe('constraints', function () {
  describe('Unqiue', function () {
    describe('constructor', function() {
      it('should set all possible constraints', function() {
        let unique = new Unique(async () => true, { minFits: 1, maxFits: 2, exactFits: 3 })
        expect(unique.minFits).to.equal(1)
        expect(unique.maxFits).to.equal(2)
        expect(unique.exactFits).to.equal(3)
      })
    })

    describe('validate', function () {
      it('should return undefined if unique', async function () {
        let unique = new Unique(async (value: any) => value === 1)
        let misfit = await unique.validate(1)
        expect(misfit).to.be.null
      })

      it('should return undefined if the value is undefined', async function () {
        let unique = new Unique(async (value: any) => value === 1)

        expect(await unique.validate(undefined)).to.be.null
      })

      it('should return a misfit if not unique', async function () {
        let unique = new Unique(async (value: any) => value === 1)

        let misfit = await unique.validate(2)
        expect(misfit).to.be.instanceOf(Misfit)
        expect(misfit?.constraint).to.equal('Unique')

        expect(await unique.validate(null)).to.be.instanceOf(Misfit)
        expect(await unique.validate('')).to.be.instanceOf(Misfit)
        expect(await unique.validate(NaN)).to.be.instanceOf(Misfit)
      })
    })
  })
})
