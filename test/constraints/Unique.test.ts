import { expect } from 'chai'
import 'mocha'
import { Misfit, Unique } from '../../src'

describe('constraints', function() {
  describe('Unqiue', function() {
    describe('validate', function() {
      describe('single property', function() {
        it('should return undefined if unique', async function() {
          let unique = new Unique(async (value: any) => value === 1)
          let misfit = await unique.validate(1)
          expect(misfit).to.be.null
        })
  
        it('should return undefined if the value is undefined', async function() {
          let unique = new Unique(async (value: any) => value === 1)
  
          expect(await unique.validate(undefined)).to.be.null
        })
  
        it('should return a misfit if not unique', async function() {
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
})
