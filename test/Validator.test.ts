import { expect } from 'chai'
import 'mocha'
import { Absent, Exists, Misfit, QuickConstraint, Required, TypeOf, Unique, Validator } from '../src'

describe('Validator', function() {
  describe('add', function() {
    it('should accept a property and a constraint', function() {
      let validator = new Validator
      let constraint = new Required
      
      validator.add('testField', constraint)
      
      let constraints = validator.constraints('testField')

      expect(constraints.length).to.equal(1)
      expect(constraints[0].constraint).to.be.instanceOf(Required)
      expect(constraints[0].validator).to.be.undefined
    })

    it('should accept a property, a constraint name and a validate function', function() {
      let validator = new Validator
      
      validator.add('testField', 'TestConstraint', async () => null)

      let constraints = validator.constraints('testField')

      expect(constraints.length).to.equal(1)
      expect(constraints[0].constraint).to.be.instanceOf(QuickConstraint)
      expect(constraints[0].constraint?.name).to.equal('TestConstraint')
      expect(constraints[0].validator).to.be.undefined
    })

    it('should accept a property combination and a constraint', function() {
      let validator = new Validator
      
      validator.add(['testField1', 'testField2'], new Required)

      let constraints = validator.constraints(['testField1', 'testField2'])

      expect(constraints.length).to.equal(1)
      expect(constraints[0].constraint).to.be.instanceOf(Required)
      expect(constraints[0].validator).to.be.undefined
    })

    it('should accept a property combination, a constraint name and a validate function', function() {
      let validator = new Validator
      
      validator.add(['testField1', 'testField2'], 'TestConstraint', async () => null)

      let constraints = validator.constraints(['testField1', 'testField2'])

      expect(constraints.length).to.equal(1)
      expect(constraints[0].constraint).to.be.instanceOf(QuickConstraint)
      expect(constraints[0].constraint?.name).to.equal('TestConstraint')
      expect(constraints[0].validator).to.be.undefined
    })

    it('should accept another validator for a property', function() {
      let validator = new Validator
      validator.add('property1', new Validator)

      let constraints = validator.constraints('property1')
    
      expect(constraints[0].constraint).to.be.undefined
      expect(constraints[0].validator).to.be.not.undefined
    })

    it('should accept another validator', function() {
      let validator1 = new Validator
      validator1.add('property1', new Required)
      validator1.add('property1', new Absent)
      validator1.add('property2', new Required)

      let validator2 = new Validator
      validator2.add(validator1)

      expect(validator2.propertyConstraints.length).to.equal(3)
      expect(validator2.propertyConstraints[0].property).to.equal('property1')
      expect(validator2.propertyConstraints[0].constraint).to.be.instanceOf(Required)
      expect(validator2.propertyConstraints[1].property).to.equal('property1')
      expect(validator2.propertyConstraints[1].constraint).to.be.instanceOf(Absent)
      expect(validator2.propertyConstraints[2].property).to.equal('property2')
      expect(validator2.propertyConstraints[2].constraint).to.be.instanceOf(Required)
    })
  })

  describe('validate', function() {
    describe('property', function() {
      it('should have a misfit if it was a misfit', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit('TestConstraint1'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('TestConstraint1')
      })
  
      it('should have a not misfit if it was not a misfit', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => null)
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(0)
      })
  
      it('should add the property name to the misfit', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit())
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].property).to.equal('a')
        expect(misfits[0].properties).to.be.undefined
      })
  
      it('should collect misfits for different properties', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit())
        validator.add('b', 'TestConstraint', async () => new Misfit())
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(2)
        expect(misfits[0].property).to.equal('a')
        expect(misfits[1].property).to.equal('b')
      })
  
      it('should consider only one constraint if more are given', async function () {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit('M1'))
        validator.add('a', 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('M1')
      })
  
      it('should check the constraints in the order given', async function () {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit('M1'))
        validator.add('a', 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('M1')
        expect(misfits[0].property).to.equal('a')
      })
  
      it('should check all constraints for a property ', async function () {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => null)
        validator.add('a', 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('M2')
        expect(misfits[0].property).to.equal('a')
      })
  
      it('should check the constraints only for properties existent on the object if the option is set', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit('M1'))
        validator.add('b', 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({ a: 'a', b: undefined }, { checkOnlyWhatIsThere: true })
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('M1')
        expect(misfits[0].property).to.equal('a')
      })  
  
      it('should check the constraints for properties that are null even if the options to check only what is there is set', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit('M1'))
        validator.add('b', 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({ a: null, b: undefined }, { checkOnlyWhatIsThere: true })
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('M1')
        expect(misfits[0].property).to.equal('a')
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
  
      it('should include a property if the option is set', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint1', async () => new Misfit)
        validator.add('a', 'TestConstraint2', async () => new Misfit)
        validator.add('b', 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {include: ['a']})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].property).to.equal('a')
        expect(misfits[0].constraint).to.equal('TestConstraint1')
      })
  
      it('should include a property if the option is set even as object with missing constraint property', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint1', async () => new Misfit)
        validator.add('a', 'TestConstraint2', async () => new Misfit)
        validator.add('b', 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {include: [{ property: 'a' }]})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].property).to.equal('a')
        expect(misfits[0].constraint).to.equal('TestConstraint1')
      })
  
      it('should include a certain constraint if the option is set', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint1', async () => new Misfit)
        validator.add('a', 'TestConstraint2', async () => new Misfit)
        validator.add('b', 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {include: [{property: 'a', constraint: 'TestConstraint2'}]})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].property).to.equal('a')
        expect(misfits[0].constraint).to.equal('TestConstraint2')
      })
  
      it('should include certain constraints if the option is set', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint1', async () => new Misfit)
        validator.add('a', 'TestConstraint2', async () => new Misfit)
        validator.add('a', 'TestConstraint3', async () => new Misfit)
        validator.add('b', 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {include: [{property: 'a', constraint: ['TestConstraint3', 'TestConstraint2']}]})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].property).to.equal('a')
        expect(misfits[0].constraint).to.equal('TestConstraint2')
      })

      it('should exclude a property if the option is set', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint1', async () => new Misfit)
        validator.add('a', 'TestConstraint2', async () => new Misfit)
        validator.add('b', 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {exclude: ['a']})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].property).to.equal('b')
        expect(misfits[0].constraint).to.equal('TestConstraint1')
      })
  
      it('should exclude a property if the option is set even as object with missing constraint property', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint1', async () => new Misfit)
        validator.add('a', 'TestConstraint2', async () => new Misfit)
        validator.add('b', 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {exclude: [{ property: 'a' }]})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].property).to.equal('b')
        expect(misfits[0].constraint).to.equal('TestConstraint1')
      })
  
      it('should exclude a certain constraint if the option is set', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint1', async () => new Misfit)
        validator.add('a', 'TestConstraint2', async () => new Misfit)
        validator.add('b', 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {exclude: [{property: 'a', constraint: 'TestConstraint1'}]})
  
        expect(misfits.length).to.equal(2)
        expect(misfits[0].property).to.equal('a')
        expect(misfits[0].constraint).to.equal('TestConstraint2')
        expect(misfits[1].property).to.equal('b')
        expect(misfits[1].constraint).to.equal('TestConstraint1')
      })
  
      it('should exclude certain constraints if the option is set', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint1', async () => new Misfit)
        validator.add('a', 'TestConstraint2', async () => new Misfit)
        validator.add('a', 'TestConstraint3', async () => new Misfit)
        validator.add('b', 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {exclude: [{property: 'a', constraint: ['TestConstraint1', 'TestConstraint2']}]})
  
        expect(misfits.length).to.equal(2)
        expect(misfits[0].property).to.equal('a')
        expect(misfits[0].constraint).to.equal('TestConstraint3')
        expect(misfits[1].property).to.equal('b')
        expect(misfits[1].constraint).to.equal('TestConstraint1')
      })

      it('should validate an object property with the given validator', async function() {
        let propertyValidator = new Validator
        propertyValidator.add('property11', 'TestConstraint1', async () => null)
        propertyValidator.add('property12', 'TestConstraint2', async () => new Misfit)

        let validator = new Validator
        validator.add('property1', propertyValidator)

        let misfits = await validator.validate({ property1: {}})

        expect(misfits.length).to.equal(1)
        expect(misfits[0].property).to.equal('property1.property12')
        expect(misfits[0].constraint).to.equal('TestConstraint2')
      })

      it('should validate an object property does not have an object value', async function() {
        let propertyValidator = new Validator
        propertyValidator.add('property11', 'TestConstraint1', async () => null)
        propertyValidator.add('property12', 'TestConstraint2', async () => new Misfit)

        let validator = new Validator
        validator.add('property1', propertyValidator)

        let misfits = await validator.validate({ property1: 1 })

        expect(misfits.length).to.equal(1)
        expect(misfits[0].property).to.equal('property1.property12')
        expect(misfits[0].constraint).to.equal('TestConstraint2')
      })

      it('should not validate an object property if it is undefined or null', async function() {
        let propertyValidator = new Validator
        propertyValidator.add('property11', 'TestConstraint1', async () => null)
        propertyValidator.add('property12', 'TestConstraint2', async () => new Misfit)

        let validator = new Validator
        validator.add('property1', propertyValidator)

        let misfits = await validator.validate({})

        expect(misfits.length).to.equal(0)
      })
    })
  
    describe('property combination', function() {
      it('should have a misfit if it was a misfit', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit('M1'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('M1')
      })
  
      it('should have a not misfit if it was not a misfit', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => null)
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(0)
      })
  
      it('should add the property name to the misfit', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit())
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].property).to.be.undefined
        expect(misfits[0].properties).to.deep.equal(['a', 'b'])
      })
  
      it('should collect misfits for different properties', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit())
        validator.add(['b', 'c'], 'TestConstraint', async () => new Misfit())
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(2)
        expect(misfits[0].properties).to.deep.equal(['a', 'b'])
        expect(misfits[1].properties).to.deep.equal(['b', 'c'])
      })
  
      it('should consider only one constraint if more are given', async function () {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit('M1'))
        validator.add(['b', 'a'], 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('M1')
      })
  
      it('should check the constraints in the order given', async function () {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit('M1'))
        validator.add(['b', 'a'], 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('M1')
        expect(misfits[0].properties).to.deep.equal(['a', 'b'])
      })
  
      it('should check all constraints for a property ', async function () {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => null)
        validator.add(['b', 'a'], 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('M2')
        expect(misfits[0].properties).to.deep.equal(['a', 'b'])
      })
  
      it('should not collect another misfit for a property that already got one', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit('M1'))
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit('M2'))
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit('M3'))
  
        let misfits = await validator.validate({ a: 'a', b: 'b' })
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('M1')
        expect(misfits[0].property).to.equal('a')
      })
  
      it('should check the constraints only for properties existent on the object if the option is set', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit('M1'))
        validator.add(['b', 'c'], 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({ a: 'a', b: 'b', c: undefined }, { checkOnlyWhatIsThere: true })
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('M1')
        expect(misfits[0].properties).to.deep.equal(['a', 'b'])
      })  
  
      it('should check the constraints for properties that are null even if the options to check only what is there is set', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit('M1'))
        validator.add(['b', 'c'], 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({ a: null, b: null, c: undefined }, { checkOnlyWhatIsThere: true })
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('M1')
        expect(misfits[0].properties).to.deep.equal(['a', 'b'])
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
  
      it('should include a property if the option is set', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint1', async () => new Misfit)
        validator.add(['a', 'b'], 'TestConstraint2', async () => new Misfit)
        validator.add(['c', 'd'], 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {include: [['a', 'b']]})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].properties).to.deep.equal(['a', 'b'])
        expect(misfits[0].constraint).to.equal('TestConstraint1')
      })
      
      it('should include a property if the option is set even as object with missing constraint property', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint1', async () => new Misfit)
        validator.add(['a', 'b'], 'TestConstraint2', async () => new Misfit)
        validator.add(['c', 'd'], 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {include: [{ property: ['a', 'b'] }]})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].properties).to.deep.equal(['a', 'b'])
        expect(misfits[0].constraint).to.equal('TestConstraint1')
      })
  
      it('should include a certain constraint if the option is set', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint1', async () => new Misfit)
        validator.add(['a', 'b'], 'TestConstraint2', async () => new Misfit)
        validator.add(['c', 'd'], 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {include: [{property: ['a', 'b'], constraint: 'TestConstraint2'}]})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].properties).to.deep.equal(['a', 'b'])
        expect(misfits[0].constraint).to.equal('TestConstraint2')
      })
  
      it('should include certain constraints if the option is set', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint1', async () => new Misfit)
        validator.add(['a', 'b'], 'TestConstraint2', async () => new Misfit)
        validator.add(['a', 'b'], 'TestConstraint3', async () => new Misfit)
        validator.add(['c', 'd'], 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {include: [{property: ['a', 'b'], constraint: ['TestConstraint3', 'TestConstraint2']}]})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].properties).to.deep.equal(['a', 'b'])
        expect(misfits[0].constraint).to.equal('TestConstraint2')
      })
  
      it('should include a property if the option is set', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint1', async () => new Misfit)
        validator.add(['a', 'b'], 'TestConstraint2', async () => new Misfit)
        validator.add(['c', 'd'], 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {exclude: [['a', 'b']]})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].properties).to.deep.equal(['c', 'd'])
        expect(misfits[0].constraint).to.equal('TestConstraint1')
      })
      
      it('should exclude a property if the option is set even as object with missing constraint property', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint1', async () => new Misfit)
        validator.add(['a', 'b'], 'TestConstraint2', async () => new Misfit)
        validator.add(['c', 'd'], 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {exclude: [{ property: ['a', 'b'] }]})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].properties).to.deep.equal(['c', 'd'])
        expect(misfits[0].constraint).to.equal('TestConstraint1')
      })
  
      it('should exclude a certain constraint if the option is set', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint1', async () => new Misfit)
        validator.add(['a', 'b'], 'TestConstraint2', async () => new Misfit)
        validator.add(['c', 'd'], 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {exclude: [{property: ['a', 'b'], constraint: 'TestConstraint1'}]})
  
        expect(misfits.length).to.equal(2)
        expect(misfits[0].properties).to.deep.equal(['a', 'b'])
        expect(misfits[0].constraint).to.equal('TestConstraint2')
        expect(misfits[1].properties).to.deep.equal(['c', 'd'])
        expect(misfits[1].constraint).to.equal('TestConstraint1')
      })
  
      it('should exclude certain constraints if the option is set', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint1', async () => new Misfit)
        validator.add(['a', 'b'], 'TestConstraint2', async () => new Misfit)
        validator.add(['a', 'b'], 'TestConstraint3', async () => new Misfit)
        validator.add(['c', 'd'], 'TestConstraint1', async () => new Misfit)
  
        let misfits = await validator.validate({a: 'a', b: 'b'}, {exclude: [{property: ['a', 'b'], constraint: ['TestConstraint1', 'TestConstraint2']}]})
  
        expect(misfits.length).to.equal(2)
        expect(misfits[0].properties).to.deep.equal(['a', 'b'])
        expect(misfits[0].constraint).to.equal('TestConstraint3')
        expect(misfits[1].properties).to.deep.equal(['c', 'd'])
        expect(misfits[1].constraint).to.equal('TestConstraint1')
      })
  
      it('should execute a Required constraint', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], new Required)
  
        let misfits = await validator.validate({})
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('Required')
  
        misfits = await validator.validate({a: 'a'})
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('Required')
  
        misfits = await validator.validate({a: 'a', b: 'b'})
        expect(misfits.length).to.equal(0)
      })
  
      it('should execute an Absent constraint', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], new Absent)
  
        let misfits = await validator.validate({a: 'a'})
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('Absent')
  
        misfits = await validator.validate({a: 'a', b: 'b'})
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('Absent')
  
        misfits = await validator.validate({})
        expect(misfits.length).to.equal(0)
      })
  
      it('should execute a TypeOf constraint', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], new TypeOf('number'))
  
        let misfits = await validator.validate({})
        expect(misfits.length).to.equal(0)
  
        misfits = await validator.validate({a: 'a'})
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('TypeOf')
  
        misfits = await validator.validate({a: 'a', b: 1})
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('TypeOf')
  
        misfits = await validator.validate({a: 0, b: 1})
        expect(misfits.length).to.equal(0)
      })
  
      it('should execute an Unique constraint', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], new Unique(async (obj: any) => {
          return obj.a == undefined && obj.b == undefined
        }))
  
        let misfits = await validator.validate({a: 'a', b: 'b'})
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('Unique')
  
        misfits = await validator.validate({})
        expect(misfits.length).to.equal(0)
      })
  
      it('should execute an Exists constraint', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], new Exists(async (obj: any) => {
          return obj.a != undefined && obj.b != undefined
        }))
  
        let misfits = await validator.validate({a: 'a', b: 'b'})
        expect(misfits.length).to.equal(0)
        
        misfits = await validator.validate({a: 'a'})
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('Exists')
      })
    })  
  })
})