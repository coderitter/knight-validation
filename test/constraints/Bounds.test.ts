import { expect } from 'chai'
import 'mocha'
import { Bounds, Misfit } from '../../src'

describe('constraints', function() {
  describe('Bounds', function() {
    describe('validate', function() {
      describe('single property', function() {
        it('should return a misfit if a number is not greater than', async function() {
          let max = new Bounds({ greaterThan: 5 })
          let misfit = await max.validate(5)
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if a number is greater than', async function() {
          let max = new Bounds({ greaterThan: 5 })
          let misfit = await max.validate(6)
          expect(misfit).to.be.null
        })
    
        it('should return a misfit if a number is not greater than equal', async function() {
          let max = new Bounds({ greaterThanEqual: 5 })
          let misfit = await max.validate(4)
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if a number is greater than equal', async function() {
          let max = new Bounds({ greaterThanEqual: 5 })
          let misfit = await max.validate(5)
          expect(misfit).to.be.null
        })
    
        it('should return a misfit if a number is not lesser than', async function() {
          let max = new Bounds({ lesserThan: 5 })
          let misfit = await max.validate(5)
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if a number is lesser than', async function() {
          let max = new Bounds({ lesserThan: 5 })
          let misfit = await max.validate(4)
          expect(misfit).to.be.null
        })
    
        it('should return a misfit if a number is not lesser than equal', async function() {
          let max = new Bounds({ lesserThanEqual: 5 })
          let misfit = await max.validate(6)
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if a number is lesser than equal', async function() {
          let max = new Bounds({ lesserThanEqual: 5 })
          let misfit = await max.validate(5)
          expect(misfit).to.be.null
        })
    
        it('should not return a misfit for not supported types', async function() {
          let max = new Bounds({ lesserThan: 5, greaterThan: 2 })
          expect(await max.validate(true)).to.be.null
          expect(await max.validate({})).to.be.null
          expect(await max.validate(undefined)).to.be.null
          expect(await max.validate(null)).to.be.null
          expect(await max.validate(new Date)).to.be.null
          expect(await max.validate(NaN)).to.be.null
        })
      })
    })
  })
})
