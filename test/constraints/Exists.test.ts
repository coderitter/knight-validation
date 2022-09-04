import { expect } from 'chai'
import 'mocha'
import { Exists, Misfit } from '../../src'

describe('constraints', function() {
  describe('Exists', function() {
    describe('validate', function() {
      describe('single property', function() {
        it('should return undefined if exists', async function() {
          let exists = new Exists(async (value: any) => value === 1)
          let misfit = await exists.validate(1)
          expect(misfit).to.be.null
        })
  
        it('should return undefined if the value is missing', async function() {
          let exists = new Exists(async (value: any) => value === 1)
  
          expect(await exists.validate(undefined)).to.be.null
        })
  
        it('should return a misfit if not exists', async function() {
          let exists = new Exists(async (value: any) => value === 1)
          expect(await exists.validate(2)).to.be.instanceOf(Misfit)
          expect(await exists.validate(null)).to.be.instanceOf(Misfit)
          expect(await exists.validate('')).to.be.instanceOf(Misfit)
          expect(await exists.validate(NaN)).to.be.instanceOf(Misfit)
        })  
      })
    })
  })
})
