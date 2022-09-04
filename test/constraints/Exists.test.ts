import { expect } from 'chai'
import 'mocha'
import { Exists, Misfit } from '../../src'

describe('constraints', function() {
  describe('Exists', function() {
    describe('validate', function() {
      describe('single property', function() {
        it('should return undefined if exists', async function() {
          let exists = new Exists(async (obj: any) => obj.value === 1)
          let misfit = await exists.validate({ value: 1 }, 'value')
          expect(misfit).to.be.null
        })
  
        it('should return undefined if the value is missing', async function() {
          let exists = new Exists(async (obj: any) => obj.value === 1)
  
          expect(await exists.validate({ value: undefined }, 'value')).to.be.null
        })
  
        it('should return a misfit if not exists', async function() {
          let exists = new Exists(async (obj: any) => obj.value === 1)
          expect(await exists.validate({ value: 2 }, 'value')).to.be.instanceOf(Misfit)
          expect(await exists.validate({ value: null }, 'value')).to.be.instanceOf(Misfit)
          expect(await exists.validate({ value: '' }, 'value')).to.be.instanceOf(Misfit)
          expect(await exists.validate({ value: NaN }, 'value')).to.be.instanceOf(Misfit)
        })  
      })

      describe('property combination', function() {
        it('should return undefined if exists', async function() {
          let exists = new Exists(async (obj: any) => obj.a === 0 && obj.b === 1)
          let misfit = await exists.validate({ a: 0, b: 1 }, ['a', 'b'])
          expect(misfit).to.be.null
        })
  
        it('should return undefined if the value is missing', async function() {
          let exists = new Exists(async (obj: any) => obj.a === 0 && obj.b === 1)
  
          expect(await exists.validate({ a: undefined, b: undefined }, ['a', 'b'])).to.be.null
        })
  
        it('should return a misfit if not exists', async function() {
          let exists = new Exists(async (obj: any) => obj.a === 0 && obj.b === 1)
          expect(await exists.validate({ a: 1, b: 2 }, ['a', 'b'])).to.be.instanceOf(Misfit)
          expect(await exists.validate({ a: null, b: null }, ['a', 'b'])).to.be.instanceOf(Misfit)
          expect(await exists.validate({ a: '', b: '' }, ['a', 'b'])).to.be.instanceOf(Misfit)
          expect(await exists.validate({ a: NaN, b: NaN }, ['a', 'b'])).to.be.instanceOf(Misfit)
        })  
      })
    })
  })
})
