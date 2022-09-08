import { expect } from 'chai'
import 'mocha'
import { Absent, Exists, Misfit, QuickConstraint, Required, TypeOf, Unique, Validator } from '../src'

describe('Validator', function() {
  describe('add', function() {
    it('should accept a property and a constraint', function() {
      let validator = new Validator      
      validator.add('testField', new Required)

      expect(validator.entries.length).to.equal(1)
      
      let entry = validator.entries[0]

      expect(entry.properties).to.deep.equal(['testField'])
      expect(entry.constraint).to.be.instanceOf(Required)
      expect(entry.validator).to.be.undefined
      expect(entry.condition).to.be.undefined
    })

    it('should accept a property, a constraint name and a validate function', function() {
      let validator = new Validator      
      validator.add('testField', 'TestConstraint', async () => null)

      expect(validator.entries.length).to.equal(1)

      let entry = validator.entries[0]

      expect(entry.properties).to.deep.equal(['testField'])
      expect(entry.constraint).to.be.instanceOf(QuickConstraint)
      expect(entry.validator).to.be.undefined
      expect(entry.condition).to.be.undefined
    })

    it('should accept multiple properties, a constraint name and a validate function', function() {
      let validator = new Validator
      validator.add(['testField1', 'testField2'], 'TestConstraint', async () => null)

      expect(validator.entries.length).to.equal(1)

      let entry = validator.entries[0]

      expect(entry.properties).to.deep.equal(['testField1', 'testField2'])
      expect(entry.constraint).to.be.instanceOf(QuickConstraint)
      expect(entry.validator).to.be.undefined
      expect(entry.condition).to.be.undefined
    })

    it('should accept another validator for a property', function() {
      let validator = new Validator
      validator.add('property', new Validator)

      expect(validator.entries.length).to.equal(1)

      let entry = validator.entries[0]
    
      expect(entry.properties).to.deep.equal(['property'])
      expect(entry.constraint).to.be.undefined
      expect(entry.validator).to.be.instanceOf(Validator)
      expect(entry.condition).to.be.undefined
    })

    it('should accept another validator', function() {
      let validator1 = new Validator
      validator1.add('property1', new Required)
      validator1.add('property1', new Absent)
      validator1.add('property2', new Required)

      let validator2 = new Validator
      validator2.add(validator1)

      expect(validator2.entries.length).to.equal(3)

      expect(validator2.entries[0].properties).to.deep.equal(['property1'])
      expect(validator2.entries[0].constraint).to.be.instanceOf(Required)
      expect(validator2.entries[0].validator).to.be.undefined
      expect(validator2.entries[0].condition).to.be.undefined

      expect(validator2.entries[1].properties).to.deep.equal(['property1'])
      expect(validator2.entries[1].constraint).to.be.instanceOf(Absent)
      expect(validator2.entries[1].validator).to.be.undefined
      expect(validator2.entries[1].condition).to.be.undefined

      expect(validator2.entries[2].properties).to.deep.equal(['property2'])
      expect(validator2.entries[2].constraint).to.be.instanceOf(Required)
      expect(validator2.entries[2].validator).to.be.undefined
      expect(validator2.entries[2].condition).to.be.undefined
    })
  })

  describe('validate', function() {
    describe('single property contstraints', function() {
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
        expect(misfits[0].properties).to.deep.equal(['a'])
      })
  
      it('should collect misfits for different properties', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit())
        validator.add('b', 'TestConstraint', async () => new Misfit())
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(2)
        expect(misfits[0].properties).to.deep.equal(['a'])
        expect(misfits[1].properties).to.deep.equal(['b'])
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
        expect(misfits[0].properties).to.deep.equal(['a'])
      })
  
      it('should check all constraints for a property ', async function () {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => null)
        validator.add('a', 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('M2')
        expect(misfits[0].properties).to.deep.equal(['a'])
      })
  
      it('should check the constraints only for properties existent on the object if the option is set', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit('M1'))
        validator.add('b', 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({ a: 'a', b: undefined }, { checkOnlyWhatIsThere: true })
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('M1')
        expect(misfits[0].properties).to.deep.equal(['a'])
      })  
  
      it('should check the constraints for properties that are null even if the options to check only what is there is set', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit('M1'))
        validator.add('b', 'TestConstraint', async () => new Misfit('M2'))
  
        let misfits = await validator.validate({ a: null, b: undefined }, { checkOnlyWhatIsThere: true })
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('M1')
        expect(misfits[0].properties).to.deep.equal(['a'])
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
  
      it('should validate an object property with the given validator', async function() {
        let propertyValidator = new Validator
        propertyValidator.add('property11', 'TestConstraint1', async () => null)
        propertyValidator.add('property12', 'TestConstraint2', async () => new Misfit)

        let validator = new Validator
        validator.add('property1', propertyValidator)

        let misfits = await validator.validate({ property1: {}})

        expect(misfits.length).to.equal(1)
        expect(misfits[0].properties).to.deep.equal(['property1.property12'])
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
        expect(misfits[0].properties).to.deep.equal(['property1.property12'])
        expect(misfits[0].constraint).to.equal('TestConstraint2')
      })

      it('should not validate an object property if it is undefined', async function() {
        let propertyValidator = new Validator
        propertyValidator.add('property11', 'TestConstraint1', async () => null)
        propertyValidator.add('property12', 'TestConstraint2', async () => new Misfit)

        let validator = new Validator
        validator.add('property1', propertyValidator)

        let misfits = await validator.validate({ property1: undefined })

        expect(misfits.length).to.equal(0)
      })

      it('should validate an object property if it is null', async function() {
        let propertyValidator = new Validator
        propertyValidator.add('property11', 'TestConstraint1', async () => null)
        propertyValidator.add('property12', 'TestConstraint2', async () => new Misfit)

        let validator = new Validator
        validator.add('property1', propertyValidator)

        let misfits = await validator.validate({ property1: null })

        expect(misfits.length).to.equal(1)
      })
    })
  
    describe('quick constraints', function() {
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
        expect(misfits[0].properties).to.deep.equal(['a', 'b'])
      })
  
      it('should collect misfits for different properties', async function() {
        let validator = new Validator
        validator.add(['a', 'b'], 'TestConstraint', async () => new Misfit())
        validator.add(['c', 'd'], 'TestConstraint', async () => new Misfit())
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(2)
        expect(misfits[0].properties).to.deep.equal(['a', 'b'])
        expect(misfits[1].properties).to.deep.equal(['c', 'd'])
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
        expect(misfits[0].properties).to.deep.equal(['b', 'a'])
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
        expect(misfits[0].properties).to.deep.equal(['a'])
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
    })

    describe('nested validators', function() {
      it('should validate a sub object', async function() {
        let nestedValidator = new Validator
        nestedValidator.add('nestedA', new Required)
        nestedValidator.add('nestedB', new TypeOf('number'))

        let validator = new Validator
        validator.add('a', nestedValidator)
  
        let misfits = await validator.validate({ a: { nestedB: 1 }})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('Required')
        expect(misfits[0].properties).to.deep.equal(['a.nestedA'])
      })

      it('should validate a sub array', async function() {
        let nestedValidator = new Validator
        nestedValidator.add('nestedA', new Required)
        nestedValidator.add('nestedB', new TypeOf('number'))

        let validator = new Validator
        validator.add('a', nestedValidator)
  
        let misfits = await validator.validate({ a: [{ nestedA: 'a', nestedB: false }, { nestedB: 1 }]})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(2)
        expect(misfits[0].constraint).to.equal('TypeOf')
        expect(misfits[0].properties).to.deep.equal(['a[0].nestedB'])
        expect(misfits[1].constraint).to.equal('Required')
        expect(misfits[1].properties).to.deep.equal(['a[1].nestedA'])
      })

      it('should be able to handle dot notifications', async function() {
        let validator = new Validator

        validator.add('a.b', 'TestConstraint1', async (value: any) => {
          if (value !== undefined) {
            return new Misfit('TestConstraint1')
          }

          return null
        })

        validator.add('a.c', 'TestConstraint2', async (value: any) => {
          if (value !== undefined) {
            return new Misfit('TestConstraint2')
          }

          return null
        })
        
        let misfits = await validator.validate({ a: { b: 'b' }})
  
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('TestConstraint1')
      })
    })
  })
})