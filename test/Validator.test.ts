import { expect } from 'chai'
import 'mocha'
import { Validator, Misfit, Required } from '../src'

describe('Validator', function() {
  describe('add', function() {
    it('should accept a field and a constraint', function() {
      let validator = new Validator
      let constraint = new Required
      
      validator.add('testField', constraint)
      
      let constraints = validator.constraints('testField')

      expect(constraints.length).to.equal(1)
      expect(constraints[0]).to.be.instanceOf(Required)
    })

    it('should accept a field and a validate function', function() {
      let validator = new Validator
      
      validator.add('testField', async () => undefined)

      let constraints = validator.constraints('testField')

      expect(constraints.length).to.equal(1)
      expect(constraints[0]).to.be.a('function')
    })

    it('should accept a field combination and a constraint', function() {
      let validator = new Validator
      
      validator.add(['testField1', 'testField2'], new Required)

      let constraints = validator.constraints(['testField1', 'testField2'])

      expect(constraints.length).to.equal(1)
      expect(constraints[0]).to.be.instanceOf(Required)
    })

    it('should accept a field combination and a validate function', function() {
      let validator = new Validator
      
      validator.add(['testField1', 'testField2'], async () => undefined)

      let constraints = validator.constraints(['testField1', 'testField2'])

      expect(constraints.length).to.equal(1)
      expect(constraints[0]).to.be.a('function')
    })
  })

  describe('validate', function() {
    describe('field', function() {
      it('should have a misfit if it was a misfit', async function() {
        let validator = new Validator
        validator.add('a', async () => new Misfit('TestConstraint1'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].type).to.equal('TestConstraint1')
      })
  
      it('should have a not misfit if it was not a misfit', async function() {
        let validator = new Validator
        validator.add('a', async () => undefined)
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(0)
      })
  
      it('should add the field name to the misfit', async function() {
        let validator = new Validator
        validator.add('a', async () => new Misfit())
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].field).to.equal('a')
        expect(misfits[0].fields).to.be.undefined
      })
  
      it('should collect misfits for different fields', async function() {
        let validator = new Validator
        validator.add('a', async () => new Misfit())
        validator.add('b', async () => new Misfit())
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(2)
        expect(misfits[0].field).to.equal('a')
        expect(misfits[1].field).to.equal('b')
      })
  
      it('should consider only one constraint if more are given', async function () {
        let validator = new Validator
        validator.add('a', async () => new Misfit('M1'))
        validator.add('a', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].type).to.equal('M1')
      })
  
      it('should check the constraints in the order given', async function () {
        let validator = new Validator
        validator.add('a', async () => new Misfit('M1'))
        validator.add('a', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].type).to.equal('M1')
        expect(misfits[0].field).to.equal('a')
      })
  
      it('should check all constraints for a field ', async function () {
        let validator = new Validator
        validator.add('a', async () => undefined)
        validator.add('a', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].type).to.equal('M2')
        expect(misfits[0].field).to.equal('a')
      })
  
      it('should check the constraints only for properties existent on the object if the option is set', async function() {
        let validator = new Validator
        validator.add('a', async () => new Misfit('M1'))
        validator.add('b', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({ a: 'a' }, { checkOnlyWhatIsThere: true })
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].type).to.equal('M1')
        expect(misfits[0].field).to.equal('a')
      })  
    })

    describe('field combination', function() {
      it('should have a misfit if it was a misfit', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], async () => new Misfit('TestConstraint1'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].type).to.equal('TestConstraint1')
      })
  
      it('should have a not misfit if it was not a misfit', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], async () => undefined)
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(0)
      })
  
      it('should add the field name to the misfit', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], async () => new Misfit())
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].field).to.be.undefined
        expect(misfits[0].fields).to.deep.equal(['a', 'b'])
      })
  
      it('should collect misfits for different fields', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], async () => new Misfit())
        validator.add(['b', 'c'], async () => new Misfit())
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(2)
        expect(misfits[0].fields).to.deep.equal(['a', 'b'])
        expect(misfits[1].fields).to.deep.equal(['b', 'c'])
      })
  
      it('should consider only one constraint if more are given', async function () {
        let validator = new Validator
        validator.add(['a', 'b'], async () => new Misfit('M1'))
        validator.add(['b', 'a'], async () => new Misfit('M2'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].type).to.equal('M1')
      })
  
      it('should check the constraints in the order given', async function () {
        let validator = new Validator
        validator.add(['a', 'b'], async () => new Misfit('M1'))
        validator.add(['b', 'a'], async () => new Misfit('M2'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].type).to.equal('M1')
        expect(misfits[0].fields).to.deep.equal(['a', 'b'])
      })
  
      it('should check all constraints for a field ', async function () {
        let validator = new Validator
        validator.add(['a', 'b'], async () => undefined)
        validator.add(['b', 'a'], async () => new Misfit('M2'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].type).to.equal('M2')
        expect(misfits[0].fields).to.deep.equal(['a', 'b'])
      })

      it('should not collect another misfit for a field that already got one', async function() {
        let validator = new Validator
        validator.add('a', async () => new Misfit('M1'))
        validator.add(['a', 'b'], async () => new Misfit('M2'))
        validator.add(['a', 'b'], async () => new Misfit('M3'))
  
        let misfits = await validator.validate({ a: 'a', b: 'b' })
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].type).to.equal('M1')
        expect(misfits[0].field).to.equal('a')
      })
  
      it('should check the constraints only for properties existent on the object if the option is set', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], async () => new Misfit('M1'))
        validator.add(['b', 'c'], async () => new Misfit('M2'))
  
        let misfits = await validator.validate({ a: 'a', b: 'b' }, { checkOnlyWhatIsThere: true })
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].type).to.equal('M1')
        expect(misfits[0].fields).to.deep.equal(['a', 'b'])
      })  
    })
  })
})