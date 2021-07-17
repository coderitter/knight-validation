import { expect } from 'chai'
import 'mocha'
import { Misfit } from '../../src'
import Unique from '../../src/lib/constraints/Unique'

describe('constraints', function() {
  describe('Unqiue', function() {
    describe('validate', function() {
      describe('single field', function() {
        it('should return undefined if unique', async function() {
          let unique = new Unique(async (obj: any) => obj.value === 1)
          let misfit = await unique.validate({ value: 1 }, 'value')
          expect(misfit).to.be.undefined
        })
  
        it('should return undefined if the value is undefined', async function() {
          let unique = new Unique(async (obj: any) => obj.value === 1)
  
          expect(await unique.validate({ value: undefined }, 'value')).to.be.undefined
          expect(await unique.validate({ value: null }, 'value')).to.be.undefined
          expect(await unique.validate({ value: '' }, 'value')).to.be.undefined
          expect(await unique.validate({ value: NaN }, 'value')).to.be.undefined
        })
  
        it('should return a misfit if not unique', async function() {
          let unique = new Unique(async (obj: any) => obj.value === 1)
          let misfit = await unique.validate({ value: 2 }, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
          expect(misfit?.constraint).to.equal('Unique')
        })  
      })

      describe('field combination', function() {
        it('should return undefined if unique', async function() {
          let unique = new Unique(async (obj: any) => obj.a === 1 && obj.b === 2)
          let misfit = await unique.validate({ a: 1, b: 2 }, ['a', 'b'])
          expect(misfit).to.be.undefined
        })
  
        it('should return undefined if the value is undefined', async function() {
          let unique = new Unique(async (obj: any) => obj.a === 1 && obj.b === 2)
  
          expect(await unique.validate({ a: undefined, b: undefined }, ['a', 'b'])).to.be.undefined
          expect(await unique.validate({ a: null, b: null }, ['a', 'b'])).to.be.undefined
          expect(await unique.validate({ a: '', b: '' }, ['a', 'b'])).to.be.undefined
          expect(await unique.validate({ a: NaN, b: NaN }, ['a', 'b'])).to.be.undefined
        })
  
        it('should return a misfit if not unique', async function() {
          let unique = new Unique(async (obj: any) => obj.a === 1 && obj.b === 2)
          let misfit = await unique.validate({ a: 2, b: 4}, ['a', 'b'])
          expect(misfit).to.be.instanceOf(Misfit)
          expect(misfit?.constraint).to.equal('Unique')
        })  
      })
    })
  })
})
