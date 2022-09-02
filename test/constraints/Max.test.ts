import { expect } from 'chai'
import 'mocha'
import { Max, Misfit } from '../../src'

describe('constraints', function() {
  describe('Max', function() {
    describe('validate', function() {
      describe('single field', function() {
        it('should return a misfit if a number is greater than the maximum', async function() {
          let max = new Max(5)
          let misfit = await max.validate({ value: 6 }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if a number is below the maximum', async function() {
          let max = new Max(5)
          let misfit = await max.validate({ value: 5 }, 'value')
          expect(misfit).to.be.undefined
        })
    
        it('should return a misfit a string is longer than the maximum', async function() {
          let max = new Max(5)
          let misfit = await max.validate({ value: '123456' }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if a string is shorter than the maximum', async function() {
          let max = new Max(5)
          let misfit = await max.validate({ value: '12345' }, 'value')
          expect(misfit).to.be.undefined
        })
    
        it('should return a misfit if an array is longer then the maximum', async function() {
          let max = new Max(5)
          let misfit = await max.validate({ value: [1, 2, 3, 4, 5, 6] }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if an array is shorter than the maximum', async function() {
          let max = new Max(5)
          let misfit = await max.validate({ value: [1, 2, 3, 4, 5] }, 'value')
          expect(misfit).to.be.undefined
        })
    
        it('should not return a misfit for not supported types', async function() {
          let max = new Max(5)
          expect(await max.validate({ value: true }, 'value')).to.be.undefined
          expect(await max.validate({ value: {} }, 'value')).to.be.undefined
          expect(await max.validate({ value: undefined }, 'value')).to.be.undefined
          expect(await max.validate({ value: null }, 'value')).to.be.undefined
          expect(await max.validate({ value: new Date }, 'value')).to.be.undefined
        })
      })

      describe('field combination', function() {
        it('should return a misfit if one number is greater than the maximum', async function() {
          let max = new Max(5)
          let misfit = await max.validate({ value1: 6, value2: 5 }, ['value1', 'value2'])
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if all numbers are below the maximum', async function() {
          let max = new Max(5)
          let misfit = await max.validate({ value1: 5, value2: 4 }, ['value1', 'value2'])
          expect(misfit).to.be.undefined
        })
    
        it('should return a misfit one string is longer than the maximum', async function() {
          let max = new Max(5)
          let misfit = await max.validate({ value1: '123456', value2: '12345' }, ['value1', 'value2'])
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if all strings are shorter than the maximum', async function() {
          let max = new Max(5)
          let misfit = await max.validate({ value1: '12345', value2: '1234' }, ['value1', 'value2'])
          expect(misfit).to.be.undefined
        })
    
        it('should return a misfit if one array is longer then the maximum', async function() {
          let max = new Max(5)
          let misfit = await max.validate({ value1: [1, 2, 3, 4, 5, 6], value2: [1, 2, 3, 4, 5] }, ['value1', 'value2'])
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if all arrays are shorter than the maximum', async function() {
          let max = new Max(5)
          let misfit = await max.validate({ value1: [1, 2, 3, 4, 5],  value2: [1, 2, 3, 4] }, ['value1', 'value2'])
          expect(misfit).to.be.undefined
        })
    
        it('should not return a misfit for not supported types', async function() {
          let max = new Max(5)
          expect(await max.validate({ value1: true, value2: false }, ['value1', 'value2'])).to.be.undefined
          expect(await max.validate({ value1: {}, value2: {} }, ['value1', 'value2'])).to.be.undefined
          expect(await max.validate({ value1: undefined, value2: undefined }, ['value1', 'value2'])).to.be.undefined
          expect(await max.validate({ value1: null, value2: null }, ['value1', 'value2'])).to.be.undefined
          expect(await max.validate({ value1: new Date, value2: new Date }, ['value1', 'value2'])).to.be.undefined
        })
      })
    })
  })
})
