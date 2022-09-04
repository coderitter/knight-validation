import { expect } from 'chai'
import 'mocha'
import { Enum, Misfit, TypeOf } from '../../src'

describe('constraints', function() {
  describe('Enum', function() {
    describe('constructor', function() {
      it('should accept an array of values', function() {
        let e = new Enum(['a', 'b'])
        expect(e.values).to.deep.equal(['a', 'b'])
      })

      it('should accept the values individually', function() {
        let e = new Enum('a', 'b')
        expect(e.values).to.deep.equal(['a', 'b'])
      })

      it('should accept the values of an TypeScript enum using string values', function() {
        let e = new Enum(StringEnum)
        expect(e.values).to.deep.equal(['A', 'B'])
      })

      it('should accept the values of an TypeScript enum using number values', function() {
        let e = new Enum(NumberEnum)
        expect(e.values).to.deep.equal([1, 2])
      })

      it('should accept the values of an TypeScript enum using mixed values', function() {
        let e = new Enum(MixedEnum)
        expect(e.values).to.deep.equal(['A', 2])
      })
    })

    describe('validate', function() {
      describe('single property', function() {
        it('should return undefined if correct type', async function() {
          let typeOf = new Enum(['a', 'b'])
          let misfit = await typeOf.validate({ value: 'a' }, 'value')
          expect(misfit).to.be.undefined
        })
  
        it('should return undefined the value is undefined', async function() {
          let typeOf = new Enum(['a', 'b'])
  
          expect(await typeOf.validate({ value: undefined }, 'value')).to.be.undefined
        })
  
        it('should return a misfit if wrong type', async function() {
          let typeOf = new Enum(['a', 'b'])
          expect(await typeOf.validate({ value: '1' }, 'value')).to.be.instanceOf(Misfit)
          expect(await typeOf.validate({ value: null }, 'value')).to.be.instanceOf(Misfit)
          expect(await typeOf.validate({ value: '' }, 'value')).to.be.instanceOf(Misfit)
          expect(await typeOf.validate({ value: NaN }, 'value')).to.be.instanceOf(Misfit)
        })

        it('should return a misfit if the value is not contained in a TypeScript enum using string values', async function() {
          let typeOf = new Enum(StringEnum)
          let misfit = await typeOf.validate({ value: 'C'}, 'value')
          expect(misfit).to.be.instanceOf(Misfit)
        })

        it('should not return a misfit if the value is contained in a TypeScript enum using string values', async function() {
          let typeOf = new Enum(StringEnum)
          let misfit = await typeOf.validate({ value: 'A'}, 'value')
          expect(misfit).to.be.undefined
        })

        it('should return a misfit if the value is not contained in a TypeScript enum using number values', async function() {
          let typeOf = new Enum(NumberEnum)
          expect(await typeOf.validate({ value: '3'}, 'value')).to.be.instanceOf(Misfit)
          expect(await typeOf.validate({ value: 'a'}, 'value')).to.be.instanceOf(Misfit)
        })

        it('should not return a misfit if the value is contained in a TypeScript enum using number values', async function() {
          let typeOf = new Enum(NumberEnum)
          let misfit = await typeOf.validate({ value: 1}, 'value')
          expect(misfit).to.be.undefined
        })

        it('should return a misfit if the value is not contained in a TypeScript enum using mixed values', async function() {
          let typeOf = new Enum(MixedEnum)
          expect(await typeOf.validate({ value: '3'}, 'value')).to.be.instanceOf(Misfit)
          expect(await typeOf.validate({ value: 'a'}, 'value')).to.be.instanceOf(Misfit)
          expect(await typeOf.validate({ value: 'C'}, 'value')).to.be.instanceOf(Misfit)
        })

        it('should not return a misfit if the value is contained in a TypeScript enum using mixed values', async function() {
          let typeOf = new Enum(MixedEnum)
          expect(await typeOf.validate({ value: 'A'}, 'value')).to.be.undefined
          expect(await typeOf.validate({ value: 2}, 'value')).to.be.undefined
        })
      })

      describe('property combination', function() {
        it('should return undefined if correct type', async function() {
          let typeOf = new Enum(['a', 'b'])
          let misfit = await typeOf.validate({ a: 'a', b: 'b' }, ['a', 'b'])
          expect(misfit).to.be.undefined
        })
  
        it('should return undefined the value is undefined', async function() {
          let typeOf = new TypeOf('number')
          expect(await typeOf.validate({ a: undefined, b: undefined }, ['a', 'b'])).to.be.undefined
        })
  
        it('should return a misfit if wrong type', async function() {
          let typeOf = new Enum(['a', 'b'])
          expect(await typeOf.validate({ a: 'a', b: '2' }, ['a', 'b'])).to.be.instanceOf(Misfit)
          expect(await typeOf.validate({ a: null, b: null }, ['a', 'b'])).to.be.instanceOf(Misfit)
          expect(await typeOf.validate({ a: '', b: '' }, ['a', 'b'])).to.be.instanceOf(Misfit)
          expect(await typeOf.validate({ a: NaN, b: NaN }, ['a', 'b'])).to.be.instanceOf(Misfit)
        })
      })
    })
  })
})

enum StringEnum {
  a = 'A', b = 'B'
}

enum NumberEnum {
  a = 1, b
}

enum MixedEnum {
  a = 'A', b = 2
}