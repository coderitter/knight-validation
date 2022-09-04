import { expect } from 'chai'
import 'mocha'
import { Absent, Misfit } from '../../src'

describe('constraints', function() {
  describe('Absent', function() {
    describe('validate', function() {
      describe('single property', function() {
        it('should not return a misfit on undefined', async function() {
          let absent = new Absent
          let misfit = await absent.validate({ value: undefined }, 'value')
          expect(misfit).to.be.undefined
        })
    
        it('should return a misfit on null', async function() {
          let absent = new Absent
          let misfit = await absent.validate({ value: null }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should return a misfit on empty string', async function() {
          let absent = new Absent
          let misfit = await absent.validate({ value: '' }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should return a misfit on NaN', async function() {
          let absent = new Absent
          let misfit = await absent.validate({ value: NaN }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should return a misfit on number', async function() {
          let absent = new Absent
          let misfit = await absent.validate({ value: 1 }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should return a misfit on boolean', async function() {
          let absent = new Absent
          expect(await absent.validate({ value: true }, 'value')).to.be.instanceOf(Misfit)
          expect(await absent.validate({ value: false }, 'value')).to.be.instanceOf(Misfit)
        })
    
        it('should return a misfit on string', async function() {
          let absent = new Absent
          let misfit = await absent.validate({ value: 'a' }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should return a misfit on object', async function() {
          let absent = new Absent
          let misfit = await absent.validate({ value: {} }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })  
      })

      describe('property combination', function() {
        it('should not return a misfit on undefined', async function() {
          let absent = new Absent
          let misfit = await absent.validate({ a: undefined, b: undefined }, ['a', 'b'])
          expect(misfit).to.be.undefined
        })
    
        it('should return a misfit on null', async function() {
          let absent = new Absent
          let misfit = await absent.validate({ a: null, b: null }, ['a', 'b'])
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should return a misfit on empty string', async function() {
          let absent = new Absent
          let misfit = await absent.validate({ a: '', b: '' }, ['a', 'b'])
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should return a misfit on NaN', async function() {
          let absent = new Absent
          let misfit = await absent.validate({ a: NaN, b: NaN }, ['a', 'b'])
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should return a misfit on number', async function() {
          let absent = new Absent
          let misfit = await absent.validate({ a: 0, b: 1 }, ['a', 'b'])
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should return a misfit on boolean', async function() {
          let absent = new Absent
          expect(await absent.validate({ a: true, b: true }, ['a', 'b'])).to.be.instanceOf(Misfit)
          expect(await absent.validate({ a: false, b: false }, ['a', 'b'])).to.be.instanceOf(Misfit)
        })
    
        it('should return a misfit on string', async function() {
          let absent = new Absent
          let misfit = await absent.validate({ a: 'a', b: 'b' }, ['a', 'b'])
          expect(misfit).to.be.instanceOf(Misfit)
        })
    
        it('should return a misfit on object', async function() {
          let absent = new Absent
          let misfit = await absent.validate({ a: {}, b: {} }, ['a', 'b'])
          expect(misfit).to.be.instanceOf(Misfit)
        })  
      })
    })
  })
})
