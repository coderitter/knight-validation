import { expect } from 'chai'
import 'mocha'
import { Validator, Misfit, Required } from '../src'

describe('Validator', function() {
  describe('add', function() {
    it('should accept a constraint', function() {
      let validator = new Validator
      let constraint = new Required
      
      validator.add(constraint)

      expect(validator.constraints).to.have.key('')
      expect(validator.constraints[''].length).to.equal(1)
      expect(validator.constraints[''][0]).to.be.instanceOf(Required)
    })

    it('should accept a field and a constraint', function() {
      let validator = new Validator
      let constraint = new Required
      
      validator.add('testField', constraint)

      expect(validator.constraints).to.have.key('testField')
      expect(validator.constraints['testField'].length).to.equal(1)
      expect(validator.constraints['testField'][0]).to.be.instanceOf(Required)
    })

    it('should accept validate function', function() {
      let validator = new Validator
      
      validator.add(async () => undefined)

      expect(validator.constraints).to.have.key('')
      expect(validator.constraints[''].length).to.equal(1)
      expect(validator.constraints[''][0]).to.be.a('function')
    })

    it('should accept a field name and a validate function', function() {
      let validator = new Validator
      
      validator.add('testField', async () => undefined)

      expect(validator.constraints).to.have.key('testField')
      expect(validator.constraints['testField'].length).to.equal(1)
      expect(validator.constraints['testField'][0]).to.be.a('function')
    })
  })

  describe('validate', function() {
    it('should have a misfit if it was a misfit', async function() {
      let validator = new Validator
      validator.add('a', () => new Misfit('TestConstraint1'))

      let misfits = await validator.validate({})

      expect(misfits).to.be.instanceOf(Array)
      expect(misfits.length).to.equal(1)
      expect(misfits[0].name).to.equal('TestConstraint1')
    })

    it('should have a not misfit if it was not a misfit', async function() {
      let validator = new Validator
      validator.add('a', () => undefined)

      let misfits = await validator.validate({})

      expect(misfits).to.be.instanceOf(Array)
      expect(misfits.length).to.equal(0)
    })

    it('should add the field name to the misfit', async function() {
      let validator = new Validator
      validator.add('a', () => new Misfit())

      let misfits = await validator.validate({})

      expect(misfits).to.be.instanceOf(Array)
      expect(misfits.length).to.equal(1)
      expect(misfits[0].field).to.equal('a')
    })

    it('should not add the field name to the misfit if there is not field given', async function() {
      let validator = new Validator
      validator.add(() => new Misfit())

      let misfits = await validator.validate({})

      expect(misfits).to.be.instanceOf(Array)
      expect(misfits.length).to.equal(1)
      expect(misfits[0].field).to.be.undefined
    })

    it('should collect misfits for different fields', async function() {
      let validator = new Validator
      validator.add('a', () => new Misfit())
      validator.add('b', () => new Misfit())

      let misfits = await validator.validate({})

      expect(misfits).to.be.instanceOf(Array)
      expect(misfits.length).to.equal(2)
      expect(misfits[0].field).to.equal('a')
      expect(misfits[1].field).to.equal('b')
    })

    it('should check only one constraint if more a given', async function () {
      let validator = new Validator
      validator.add('a', () => new Misfit('M1'))
      validator.add('a', () => new Misfit('M2'))

      let misfits = await validator.validate({})

      expect(misfits).to.be.instanceOf(Array)
      expect(misfits.length).to.equal(1)
    })

    it('should check the constraints in the order given', async function () {
      let validator = new Validator
      validator.add('a', () => new Misfit('M1'))
      validator.add('a', () => new Misfit('M2'))

      let misfits = await validator.validate({})

      expect(misfits).to.be.instanceOf(Array)
      expect(misfits.length).to.equal(1)
      expect(misfits[0].field).to.equal('a')
      expect(misfits[0].name).to.equal('M1')      
    })

    it('should check all constraints for a field ', async function () {
      let validator = new Validator
      validator.add('a', () => undefined)
      validator.add('a', () => new Misfit('M2'))

      let misfits = await validator.validate({})

      expect(misfits).to.be.instanceOf(Array)
      expect(misfits.length).to.equal(1)
      expect(misfits[0].field).to.equal('a')
      expect(misfits[0].name).to.equal('M2')
    })

    it('should check the constraints only for properties existent on the object if the option is set', async function() {
      let validator = new Validator
      validator.add('a', () => new Misfit('M1'))
      validator.add('b', () => new Misfit('M2'))

      let misfits = await validator.validate({ a: 'a' }, { checkOnlyWhatIsThere: true })

      expect(misfits).to.be.instanceOf(Array)
      expect(misfits.length).to.equal(1)
      expect(misfits[0].field).to.equal('a')
      expect(misfits[0].name).to.equal('M1')
    })
  })
})