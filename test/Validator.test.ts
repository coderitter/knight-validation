import { expect } from 'chai'
import 'mocha'
import { Absent, Exists, Misfit, Required, TypeOf, Unique, Validator } from '../src'
import QuickConstraint from '../src/lib/constraints/QuickConstraint'

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

    it('should accept a field, a constraint name and a validate function', function() {
      let validator = new Validator
      
      validator.add('testField', 'TestConstraint', async () => undefined)

      let constraints = validator.constraints('testField')

      expect(constraints.length).to.equal(1)
      expect(constraints[0]).to.be.instanceOf(QuickConstraint)
      expect(constraints[0].name).to.equal('TestConstraint')
    })

    it('should accept a field combination and a constraint', function() {
      let validator = new Validator
      
      validator.add(['testField1', 'testField2'], new Required)

      let constraints = validator.constraints(['testField1', 'testField2'])

      expect(constraints.length).to.equal(1)
      expect(constraints[0]).to.be.instanceOf(Required)
    })

    it('should accept a field combination, a constraint name and a validate function', function() {
      let validator = new Validator
      
      validator.add(['testField1', 'testField2'], 'TestConstraint', async () => undefined)

      let constraints = validator.constraints(['testField1', 'testField2'])

      expect(constraints.length).to.equal(1)
      expect(constraints[0]).to.be.instanceOf(QuickConstraint)
      expect(constraints[0].name).to.equal('TestConstraint')      
    })
  })

  describe('validate', function() {
    describe('field', function() {
      it('should have a misfit if it was a misfit', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit('TestConstraint1'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].name).to.equal('TestConstraint1')
      })
  
      it('should have a not misfit if it was not a misfit', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => undefined)
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(0)
      })
  
      it('should add the field name to the misfit', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit())
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].field).to.equal('a')
        expect(misfits[0].fields).to.be.undefined
      })
  
      it('should collect misfits for different fields', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit())
        validator.add('b', 'TestConstraint', async () => new Misfit())
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(2)
        expect(misfits[0].field).to.equal('a')
        expect(misfits[1].field).to.equal('b')
      })
  
      it('should consider only one constraint if more are given', async function () {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit('M1'))
        validator.add('a', 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].name).to.equal('M1')
      })
  
      it('should check the constraints in the order given', async function () {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit('M1'))
        validator.add('a', 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].name).to.equal('M1')
        expect(misfits[0].field).to.equal('a')
      })
  
      it('should check all constraints for a field ', async function () {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => undefined)
        validator.add('a', 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].name).to.equal('M2')
        expect(misfits[0].field).to.equal('a')
      })
  
      it('should check the constraints only for properties existent on the object if the option is set', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit('M1'))
        validator.add('b', 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({ a: 'a', b: undefined }, { checkOnlyWhatIsThere: true })
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].name).to.equal('M1')
        expect(misfits[0].field).to.equal('a')
      })  
  
      it('should check the constraints for properties that are null even if the options to check only what is there is set', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit('M1'))
        validator.add('b', 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({ a: null, b: undefined }, { checkOnlyWhatIsThere: true })
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].name).to.equal('M1')
        expect(misfits[0].field).to.equal('a')
      })
  
      it('should only check a constraint if the given condition is met', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit('M1'), async () => true)
        
        let misfits = await validator.validate({})
  
        expect(misfits.length).to.equal(1)
      })
  
      it('should not check a constraint if the given condition is not met', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit('M1'), async () => false)
        
        let misfits = await validator.validate({})
  
        expect(misfits.length).to.equal(0)
      })
  
      it('should include a field if the option is set', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint1', async () => new Misfit)
        validator.add('a', 'TestConstraint2', async () => new Misfit)
        validator.add('b', 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {include: ['a']})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].field).to.equal('a')
        expect(misfits[0].name).to.equal('TestConstraint1')
      })
  
      it('should include a field if the option is set even as object with missing constraint property', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint1', async () => new Misfit)
        validator.add('a', 'TestConstraint2', async () => new Misfit)
        validator.add('b', 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {include: [{ field: 'a' }]})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].field).to.equal('a')
        expect(misfits[0].name).to.equal('TestConstraint1')
      })
  
      it('should include a certain constraint if the option is set', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint1', async () => new Misfit)
        validator.add('a', 'TestConstraint2', async () => new Misfit)
        validator.add('b', 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {include: [{field: 'a', constraint: 'TestConstraint2'}]})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].field).to.equal('a')
        expect(misfits[0].name).to.equal('TestConstraint2')
      })
  
      it('should include certain constraints if the option is set', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint1', async () => new Misfit)
        validator.add('a', 'TestConstraint2', async () => new Misfit)
        validator.add('a', 'TestConstraint3', async () => new Misfit)
        validator.add('b', 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {include: [{field: 'a', constraint: ['TestConstraint3', 'TestConstraint2']}]})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].field).to.equal('a')
        expect(misfits[0].name).to.equal('TestConstraint2')
      })

      it('should exclude a field if the option is set', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint1', async () => new Misfit)
        validator.add('a', 'TestConstraint2', async () => new Misfit)
        validator.add('b', 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {exclude: ['a']})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].field).to.equal('b')
        expect(misfits[0].name).to.equal('TestConstraint1')
      })
  
      it('should exclude a field if the option is set even as object with missing constraint property', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint1', async () => new Misfit)
        validator.add('a', 'TestConstraint2', async () => new Misfit)
        validator.add('b', 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {exclude: [{ field: 'a' }]})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].field).to.equal('b')
        expect(misfits[0].name).to.equal('TestConstraint1')
      })
  
      it('should exclude a certain constraint if the option is set', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint1', async () => new Misfit)
        validator.add('a', 'TestConstraint2', async () => new Misfit)
        validator.add('b', 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {exclude: [{field: 'a', constraint: 'TestConstraint1'}]})
  
        expect(misfits.length).to.equal(2)
        expect(misfits[0].field).to.equal('a')
        expect(misfits[0].name).to.equal('TestConstraint2')
        expect(misfits[1].field).to.equal('b')
        expect(misfits[1].name).to.equal('TestConstraint1')
      })
  
      it('should exclude certain constraints if the option is set', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint1', async () => new Misfit)
        validator.add('a', 'TestConstraint2', async () => new Misfit)
        validator.add('a', 'TestConstraint3', async () => new Misfit)
        validator.add('b', 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {exclude: [{field: 'a', constraint: ['TestConstraint1', 'TestConstraint2']}]})
  
        expect(misfits.length).to.equal(2)
        expect(misfits[0].field).to.equal('a')
        expect(misfits[0].name).to.equal('TestConstraint3')
        expect(misfits[1].field).to.equal('b')
        expect(misfits[1].name).to.equal('TestConstraint1')
      })
    })
  
    describe('field combination', function() {
      it('should have a misfit if it was a misfit', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit('M1'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].name).to.equal('M1')
      })
  
      it('should have a not misfit if it was not a misfit', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => undefined)
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(0)
      })
  
      it('should add the field name to the misfit', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit())
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].field).to.be.undefined
        expect(misfits[0].fields).to.deep.equal(['a', 'b'])
      })
  
      it('should collect misfits for different fields', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit())
        validator.add(['b', 'c'], 'TestConstraint', async () => new Misfit())
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(2)
        expect(misfits[0].fields).to.deep.equal(['a', 'b'])
        expect(misfits[1].fields).to.deep.equal(['b', 'c'])
      })
  
      it('should consider only one constraint if more are given', async function () {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit('M1'))
        validator.add(['b', 'a'], 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].name).to.equal('M1')
      })
  
      it('should check the constraints in the order given', async function () {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit('M1'))
        validator.add(['b', 'a'], 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].name).to.equal('M1')
        expect(misfits[0].fields).to.deep.equal(['a', 'b'])
      })
  
      it('should check all constraints for a field ', async function () {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => undefined)
        validator.add(['b', 'a'], 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].name).to.equal('M2')
        expect(misfits[0].fields).to.deep.equal(['a', 'b'])
      })
  
      it('should not collect another misfit for a field that already got one', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit('M1'))
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit('M2'))
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit('M3'))
  
        let misfits = await validator.validate({ a: 'a', b: 'b' })
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].name).to.equal('M1')
        expect(misfits[0].field).to.equal('a')
      })
  
      it('should check the constraints only for properties existent on the object if the option is set', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit('M1'))
        validator.add(['b', 'c'], 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({ a: 'a', b: 'b', c: undefined }, { checkOnlyWhatIsThere: true })
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].name).to.equal('M1')
        expect(misfits[0].fields).to.deep.equal(['a', 'b'])
      })  
  
      it('should check the constraints for properties that are null even if the options to check only what is there is set', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit('M1'))
        validator.add(['b', 'c'], 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({ a: null, b: null, c: undefined }, { checkOnlyWhatIsThere: true })
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].name).to.equal('M1')
        expect(misfits[0].fields).to.deep.equal(['a', 'b'])
      })
  
      it('should only check a constraint if the given condition is met', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit('M1'), async () => true)
        
        let misfits = await validator.validate({})
  
        expect(misfits.length).to.equal(1)
      })
  
      it('should not check a constraint if the given condition is not met', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit('M1'), async () => false)
        
        let misfits = await validator.validate({})
  
        expect(misfits.length).to.equal(0)
      })
  
      it('should include a field if the option is set', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint1', async () => new Misfit)
        validator.add(['a', 'b'], 'TestConstraint2', async () => new Misfit)
        validator.add(['c', 'd'], 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {include: [['a', 'b']]})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].fields).to.deep.equal(['a', 'b'])
        expect(misfits[0].name).to.equal('TestConstraint1')
      })
      
      it('should include a field if the option is set even as object with missing constraint property', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint1', async () => new Misfit)
        validator.add(['a', 'b'], 'TestConstraint2', async () => new Misfit)
        validator.add(['c', 'd'], 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {include: [{ field: ['a', 'b'] }]})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].fields).to.deep.equal(['a', 'b'])
        expect(misfits[0].name).to.equal('TestConstraint1')
      })
  
      it('should include a certain constraint if the option is set', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint1', async () => new Misfit)
        validator.add(['a', 'b'], 'TestConstraint2', async () => new Misfit)
        validator.add(['c', 'd'], 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {include: [{field: ['a', 'b'], constraint: 'TestConstraint2'}]})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].fields).to.deep.equal(['a', 'b'])
        expect(misfits[0].name).to.equal('TestConstraint2')
      })
  
      it('should include certain constraints if the option is set', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint1', async () => new Misfit)
        validator.add(['a', 'b'], 'TestConstraint2', async () => new Misfit)
        validator.add(['a', 'b'], 'TestConstraint3', async () => new Misfit)
        validator.add(['c', 'd'], 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {include: [{field: ['a', 'b'], constraint: ['TestConstraint3', 'TestConstraint2']}]})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].fields).to.deep.equal(['a', 'b'])
        expect(misfits[0].name).to.equal('TestConstraint2')
      })
  
      it('should include a field if the option is set', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint1', async () => new Misfit)
        validator.add(['a', 'b'], 'TestConstraint2', async () => new Misfit)
        validator.add(['c', 'd'], 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {exclude: [['a', 'b']]})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].fields).to.deep.equal(['c', 'd'])
        expect(misfits[0].name).to.equal('TestConstraint1')
      })
      
      it('should exclude a field if the option is set even as object with missing constraint property', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint1', async () => new Misfit)
        validator.add(['a', 'b'], 'TestConstraint2', async () => new Misfit)
        validator.add(['c', 'd'], 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {exclude: [{ field: ['a', 'b'] }]})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].fields).to.deep.equal(['c', 'd'])
        expect(misfits[0].name).to.equal('TestConstraint1')
      })
  
      it('should exclude a certain constraint if the option is set', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint1', async () => new Misfit)
        validator.add(['a', 'b'], 'TestConstraint2', async () => new Misfit)
        validator.add(['c', 'd'], 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {exclude: [{field: ['a', 'b'], constraint: 'TestConstraint1'}]})
  
        expect(misfits.length).to.equal(2)
        expect(misfits[0].fields).to.deep.equal(['a', 'b'])
        expect(misfits[0].name).to.equal('TestConstraint2')
        expect(misfits[1].fields).to.deep.equal(['c', 'd'])
        expect(misfits[1].name).to.equal('TestConstraint1')
      })
  
      it('should exclude certain constraints if the option is set', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint1', async () => new Misfit)
        validator.add(['a', 'b'], 'TestConstraint2', async () => new Misfit)
        validator.add(['a', 'b'], 'TestConstraint3', async () => new Misfit)
        validator.add(['c', 'd'], 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {exclude: [{field: ['a', 'b'], constraint: ['TestConstraint1', 'TestConstraint2']}]})
  
        expect(misfits.length).to.equal(2)
        expect(misfits[0].fields).to.deep.equal(['a', 'b'])
        expect(misfits[0].name).to.equal('TestConstraint3')
        expect(misfits[1].fields).to.deep.equal(['c', 'd'])
        expect(misfits[1].name).to.equal('TestConstraint1')
      })
  
      it('should execute a Required constraint', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], new Required)
  
        let misfits = await validator.validate({})
        expect(misfits.length).to.equal(1)
        expect(misfits[0].name).to.equal('Required')
  
        misfits = await validator.validate({a: 'a'})
        expect(misfits.length).to.equal(1)
        expect(misfits[0].name).to.equal('Required')
  
        misfits = await validator.validate({a: 'a', b: 'b'})
        expect(misfits.length).to.equal(0)
      })
  
      it('should execute an Absent constraint', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], new Absent)
  
        let misfits = await validator.validate({a: 'a'})
        expect(misfits.length).to.equal(1)
        expect(misfits[0].name).to.equal('Absent')
  
        misfits = await validator.validate({a: 'a', b: 'b'})
        expect(misfits.length).to.equal(1)
        expect(misfits[0].name).to.equal('Absent')
  
        misfits = await validator.validate({})
        expect(misfits.length).to.equal(0)
      })
  
      it('should execute an TypeOf constraint', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], new TypeOf('number'))
  
        let misfits = await validator.validate({})
        expect(misfits.length).to.equal(0)
  
        misfits = await validator.validate({a: 'a'})
        expect(misfits.length).to.equal(0)
  
        misfits = await validator.validate({a: 'a', b: 1})
        expect(misfits.length).to.equal(1)
        expect(misfits[0].name).to.equal('TypeOf')
  
        misfits = await validator.validate({a: 0, b: 1})
        expect(misfits.length).to.equal(0)
      })
  
      it('should execute a Unique constraint', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], new Unique(async (value: any, obj: any) => {
          return obj.a != undefined && obj.b != undefined
        }))
  
        let misfits = await validator.validate({a: 'a', b: 'b'})
        expect(misfits.length).to.equal(1)
        expect(misfits[0].name).to.equal('Unique')
  
        misfits = await validator.validate({a: 'a'})
        expect(misfits.length).to.equal(0)
      })
  
      it('should execute an Exists constraint', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], new Exists(async (value: any, obj: any) => {
          return obj.a != undefined && obj.b != undefined
        }))
  
        let misfits = await validator.validate({a: 'a', b: 'b'})
        expect(misfits.length).to.equal(1)
        expect(misfits[0].name).to.equal('Exists')
  
        misfits = await validator.validate({a: 'a'})
        expect(misfits.length).to.equal(0)
      })
    })  
  })
})