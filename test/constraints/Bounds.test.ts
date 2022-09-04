import { expect } from 'chai'
import 'mocha'
import { Bounds, Misfit } from '../../src'

describe('constraints', function() {
  describe('Bounds', function() {
    describe('validate', function() {
      describe('single field', function() {
        it('should return a misfit if a number is not greater than', async function() {
          let max = new Bounds({ greaterThan: 5 })
          let misfit = await max.validate({ value: 5 }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if a number is greater than', async function() {
          let max = new Bounds({ greaterThan: 5 })
          let misfit = await max.validate({ value: 6 }, 'value')
          expect(misfit).to.be.undefined
        })
    
        it('should return a misfit if a number is not greater than equal', async function() {
          let max = new Bounds({ greaterThanEqual: 5 })
          let misfit = await max.validate({ value: 4 }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if a number is greater than equal', async function() {
          let max = new Bounds({ greaterThanEqual: 5 })
          let misfit = await max.validate({ value: 5 }, 'value')
          expect(misfit).to.be.undefined
        })
    
        it('should return a misfit if a number is not lesser than', async function() {
          let max = new Bounds({ lesserThan: 5 })
          let misfit = await max.validate({ value: 5 }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if a number is lesser than', async function() {
          let max = new Bounds({ lesserThan: 5 })
          let misfit = await max.validate({ value: 4 }, 'value')
          expect(misfit).to.be.undefined
        })
    
        it('should return a misfit if a number is not lesser than equal', async function() {
          let max = new Bounds({ lesserThanEqual: 5 })
          let misfit = await max.validate({ value: 6 }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if a number is lesser than equal', async function() {
          let max = new Bounds({ lesserThanEqual: 5 })
          let misfit = await max.validate({ value: 5 }, 'value')
          expect(misfit).to.be.undefined
        })
    
        it('should not return a misfit for not supported types', async function() {
          let max = new Bounds({ lesserThan: 5, greaterThan: 2 })
          expect(await max.validate({ value: true }, 'value')).to.be.undefined
          expect(await max.validate({ value: {} }, 'value')).to.be.undefined
          expect(await max.validate({ value: undefined }, 'value')).to.be.undefined
          expect(await max.validate({ value: null }, 'value')).to.be.undefined
          expect(await max.validate({ value: new Date }, 'value')).to.be.undefined
          expect(await max.validate({ value: NaN }, 'value')).to.be.undefined
        })
      })

      describe('field combination', function() {
        it('should return a misfit if a number is not greater than', async function() {
          let max = new Bounds({ greaterThan: 5 })
          let misfit = await max.validate({ value1: 6, value2: 5 }, [ 'value1', 'value2' ])
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if a number is greater than', async function() {
          let max = new Bounds({ greaterThan: 5 })
          let misfit = await max.validate({ value1: 6, value2: 6 }, [ 'value1', 'value2' ])
          expect(misfit).to.be.undefined
        })
    
        it('should return a misfit if a number is not greater than equal', async function() {
          let max = new Bounds({ greaterThanEqual: 5 })
          let misfit = await max.validate({ value1: 5, value2: 4 }, [ 'value1', 'value2' ])
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if a number is greater than equal', async function() {
          let max = new Bounds({ greaterThanEqual: 5 })
          let misfit = await max.validate({ value1: 5, value2: 5 }, [ 'value1', 'value2' ])
          expect(misfit).to.be.undefined
        })
    
        it('should return a misfit if a number is not lesser than', async function() {
          let max = new Bounds({ lesserThan: 5 })
          let misfit = await max.validate({ value1: 4, value2: 5 }, [ 'value1', 'value2' ])
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if a number is lesser than', async function() {
          let max = new Bounds({ lesserThan: 5 })
          let misfit = await max.validate({ value1: 4, value2: 4 }, [ 'value1', 'value2' ])
          expect(misfit).to.be.undefined
        })
    
        it('should return a misfit if a number is not lesser than equal', async function() {
          let max = new Bounds({ lesserThanEqual: 5 })
          let misfit = await max.validate({ value1: 5, value2: 6 }, [ 'value1', 'value2' ])
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if a number is lesser than equal', async function() {
          let max = new Bounds({ lesserThanEqual: 5 })
          let misfit = await max.validate({ value1: 5, value2: 5 }, [ 'value1', 'value2' ])
          expect(misfit).to.be.undefined
        })
    
        it('should not return a misfit for not supported types', async function() {
          let max = new Bounds({ lesserThan: 5, greaterThan: 2 })
          expect(await max.validate({ value1: true, value2: true }, [ 'value1', 'value2' ])).to.be.undefined
          expect(await max.validate({ value1: {}, value2: {} }, [ 'value1', 'value2' ])).to.be.undefined
          expect(await max.validate({ value1: undefined, value2: undefined }, [ 'value1', 'value2' ])).to.be.undefined
          expect(await max.validate({ value1: null, value2: null }, [ 'value1', 'value2' ])).to.be.undefined
          expect(await max.validate({ value1: new Date, value2: new Date }, [ 'value1', 'value2' ])).to.be.undefined
          expect(await max.validate({ value1: NaN, value2: NaN }, [ 'value1', 'value2' ])).to.be.undefined
        })
      })
    })
  })
})
