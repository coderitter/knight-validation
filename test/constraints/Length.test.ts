import { expect } from 'chai'
import 'mocha'
import { Length, Misfit } from '../../src'

describe('constraints', function() {
  describe('Max', function() {
    describe('validate', function() {
      describe('single property', function() {
        it('should return a misfit if the length of a string is below the minimum', async function() {
          let max = new Length({ min: 5 })
          let misfit = await max.validate({ value: '1234' }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if the length of a string is above the minimum', async function() {
          let max = new Length({ min: 5 })
          let misfit = await max.validate({ value: '12345' }, 'value')
          expect(misfit).to.be.null
        })
    
        it('should return a misfit if the length of a string is above the maximum', async function() {
          let max = new Length({ max: 5 })
          let misfit = await max.validate({ value: '123456' }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit  if the length of a string is below the maximum', async function() {
          let max = new Length({ max: 5 })
          let misfit = await max.validate({ value: '12345' }, 'value')
          expect(misfit).to.be.null
        })
    
        it('should return a misfit if the length of a string is not exact', async function() {
          let max = new Length({ exact: 5 })
          
          let misfit = await max.validate({ value: '1234' }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
          
          misfit = await max.validate({ value: '123456' }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit  if the length of a string is exact', async function() {
          let max = new Length({ max: 5 })
          let misfit = await max.validate({ value: '12345' }, 'value')
          expect(misfit).to.be.null
        })

        it('should return a misfit if the length of an array is below the minimum', async function() {
          let max = new Length({ min: 5 })
          let misfit = await max.validate({ value: [ 1, 2, 3, 4 ] }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if the length of an array is above the minimum', async function() {
          let max = new Length({ min: 5 })
          let misfit = await max.validate({ value: [ 1, 2, 3, 4, 5 ] }, 'value')
          expect(misfit).to.be.null
        })
    
        it('should return a misfit if the length of an array is above the maximum', async function() {
          let max = new Length({ max: 5 })
          let misfit = await max.validate({ value: [ 1, 2, 3, 4, 5, 6 ] }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit  if the length of an array is below the maximum', async function() {
          let max = new Length({ max: 5 })
          let misfit = await max.validate({ value: [ 1, 2, 3, 4, 5 ] }, 'value')
          expect(misfit).to.be.null
        })
    
        it('should return a misfit if the length of an array is not exact', async function() {
          let max = new Length({ exact: 5 })
          
          let misfit = await max.validate({ value: [ 1, 2, 3, 4 ] }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
          
          misfit = await max.validate({ value: [ 1, 2, 3, 4, 5, 6 ] }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit  if the length of an array is exact', async function() {
          let max = new Length({ max: 5 })
          let misfit = await max.validate({ value: [ 1, 2, 3, 4, 5 ] }, 'value')
          expect(misfit).to.be.null
        })
      })

      describe('property combination', function() {
        it('should return a misfit if the length of a string is below the minimum', async function() {
          let max = new Length({ min: 5 })
          let misfit = await max.validate({ value1: '12345', value2: [ 1, 2, 3, 4 ] }, [ 'value1', 'value2' ])
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit if the length of a string is above the minimum', async function() {
          let max = new Length({ min: 5 })
          let misfit = await max.validate({ value1: '12345', value2: [ 1, 2, 3, 4, 5 ] }, [ 'value1', 'value2' ])
          expect(misfit).to.be.null
        })
    
        it('should return a misfit if the length of a string is above the maximum', async function() {
          let max = new Length({ max: 5 })
          let misfit = await max.validate({ value1: '12345', value2: [ 1, 2, 3, 4, 5, 6 ] }, [ 'value1', 'value2' ])
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit  if the length of a string is below the maximum', async function() {
          let max = new Length({ max: 5 })
          let misfit = await max.validate({ value1: '12345', value2: [ 1, 2, 3, 4, 5 ] }, [ 'value1', 'value2' ])
          expect(misfit).to.be.null
        })
    
        it('should return a misfit if the length of a string is not exact', async function() {
          let max = new Length({ exact: 5 })
          
          let misfit = await max.validate({ value1: '12345', value2: [ 1, 2, 3, 4 ] }, [ 'value1', 'value2' ])
          expect(misfit).to.be.instanceOf(Misfit)
          
          misfit = await max.validate({ value1: '12345', value2: [ 1, 2, 3, 4, 5, 6 ] }, [ 'value1', 'value2' ])
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should not return a misfit  if the length of a string is exact', async function() {
          let max = new Length({ max: 5 })
          let misfit = await max.validate({ value1: '12345', value2: [ 1, 2, 3, 4, 5 ] }, [ 'value1', 'value2' ])
          expect(misfit).to.be.null
        })
      })
    })
  })
})
