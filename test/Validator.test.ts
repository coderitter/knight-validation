import { expect } from 'chai'
import { Misfit } from 'knight-misfit'
import 'mocha'
import { Absent, QuickConstraint, Required, TypeOf, Validator } from '../src'

describe('Validator', function() {
  describe('add', function() {
    it('should accept a constraint and a condition', function() {
      let validator = new Validator      
      validator.add(new Required, async obj => true)

      expect(validator.entries.length).to.equal(1)
      
      let entry = validator.entries[0]

      expect(entry.properties).to.deep.equal([])
      expect(entry.constraint).to.be.instanceOf(Required)
      expect(entry.validator).to.be.undefined
      expect(entry.condition).to.be.a('function')
    })

    it('should accept a constraint name, a validate function and a condition', function() {
      let validator = new Validator      
      validator.add('TestConstraint', async () => null, async obj => true)

      expect(validator.entries.length).to.equal(1)
      
      let entry = validator.entries[0]

      expect(entry.properties).to.deep.equal([])
      expect(entry.constraint).to.be.instanceOf(QuickConstraint)
      expect(entry.validator).to.be.undefined
      expect(entry.condition).to.be.a('function')
    })

    it('should accept a property, a constraint and a condition', function() {
      let validator = new Validator      
      validator.add('testField', new Required, async obj => true)

      expect(validator.entries.length).to.equal(1)
      
      let entry = validator.entries[0]

      expect(entry.properties).to.deep.equal(['testField'])
      expect(entry.constraint).to.be.instanceOf(Required)
      expect(entry.validator).to.be.undefined
      expect(entry.condition).to.be.a('function')
    })

    it('should accept a property, a constraint name, a validate function and a condition', function() {
      let validator = new Validator      
      validator.add('testField', 'TestConstraint', async () => null, async obj => true)

      expect(validator.entries.length).to.equal(1)

      let entry = validator.entries[0]

      expect(entry.properties).to.deep.equal(['testField'])
      expect(entry.constraint).to.be.instanceOf(QuickConstraint)
      expect(entry.validator).to.be.undefined
      expect(entry.condition).to.be.a('function')
    })

    it('should accept multiple properties, a constraint and a condition', function() {
      let validator = new Validator
      validator.add(['testField1', 'testField2'], new Required, async obj => true)

      expect(validator.entries.length).to.equal(1)

      let entry = validator.entries[0]

      expect(entry.properties).to.deep.equal(['testField1', 'testField2'])
      expect(entry.constraint).to.be.instanceOf(Required)
      expect(entry.validator).to.be.undefined
      expect(entry.condition).to.be.a('function')
    })

    it('should accept multiple properties, a constraint name, a validate function and a condition', function() {
      let validator = new Validator
      validator.add(['testField1', 'testField2'], 'TestConstraint', async () => null, async obj => true)

      expect(validator.entries.length).to.equal(1)

      let entry = validator.entries[0]

      expect(entry.properties).to.deep.equal(['testField1', 'testField2'])
      expect(entry.constraint).to.be.instanceOf(QuickConstraint)
      expect(entry.validator).to.be.undefined
      expect(entry.condition).to.be.a('function')
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

    it('should not add excluded constraints', function() {
      let validator = new Validator({ exclude: ['property2']})

      validator.add('property1', new Required)
      validator.add('property1', new TypeOf('number'))
      validator.add('property2', new Required)
      validator.add('property2', 'TestConstraint', async value => null)
      validator.add('property2', new Validator)
      validator.add('property3', new Required)
      validator.add('property3', new TypeOf('number'))

      expect(validator.entries.some(entry => entry.properties.length == 1 && entry.properties[0] == 'property2')).to.be.false
      expect(validator.entries.filter(entry => entry.properties.length == 1 && entry.properties[0] != 'property2').length).to.equal(4)
    })
  })

  describe('validate', function() {
    describe('whole object constraints', function() {
      it('should return a misfit for the whole object', async function() {
        let validator = new Validator
        validator.add('TestConstraint', async () => new Misfit('TestConstraint1'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('TestConstraint1')
        expect(misfits[0].properties).to.deep.equal([])
      })
  
      it('should not return a misfit for the whole object', async function() {
        let validator = new Validator
        validator.add('TestConstraint', async () => null)
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(0)
      })
  
      it('should return a misfit for the whole object if it should check only what is there', async function() {
        let validator = new Validator
        validator.add('TestConstraint', async () => new Misfit('TestConstraint1'))
  
        let misfits = await validator.validate({}, { checkOnlyWhatIsThere: true })
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('TestConstraint1')
        expect(misfits[0].properties).to.deep.equal([])
      })

      it('should not return a misfit for the whole object if it should check only what is there', async function() {
        let validator = new Validator
        validator.add('TestConstraint', async () => null)
  
        let misfits = await validator.validate({}, { checkOnlyWhatIsThere: true })
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(0)
      })

      it('should only collect one misfit of all the given constraints for the whole object', async function() {
        let validator = new Validator
        validator.add('TestConstraint', async () => new Misfit('TestConstraint1'))
        validator.add('TestConstraint', async () => new Misfit('TestConstraint2'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('TestConstraint1')
        expect(misfits[0].properties).to.deep.equal([])
      })
    })

    describe('single property constraints', function() {
      it('should return a misfit for a property', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => new Misfit('TestConstraint1'))
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('TestConstraint1')
        expect(misfits[0].properties).to.deep.equal(['a'])
      })
  
      it('should not return a misfit for a property', async function() {
        let validator = new Validator
        validator.add('a', 'TestConstraint', async () => null)
  
        let misfits = await validator.validate({})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(0)
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
  
      it('should only collect one misfit per property', async function () {
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
  
      it('should check all constraints of a property ', async function () {
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

        // Test a second time to make sure to catch bugs which appear only the second time
        misfits = await validator.validate({ a: { nestedB: 1 }})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('Required')
        expect(misfits[0].properties).to.deep.equal(['a.nestedA'])
      })

      it('should not validate a sub object which is undefined', async function() {
        let nestedValidator = new Validator
        nestedValidator.add('nestedA', new Required)
        nestedValidator.add('nestedB', new TypeOf('number'))

        let validator = new Validator
        validator.add('a', nestedValidator)
  
        let misfits = await validator.validate({ a: undefined})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(0)
      })

      it('should not validate a sub object which is null', async function() {
        let nestedValidator = new Validator
        nestedValidator.add('nestedA', new Required)
        nestedValidator.add('nestedB', new TypeOf('number'))

        let validator = new Validator
        validator.add('a', nestedValidator)
  
        let misfits = await validator.validate({ a: null})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(0)
      })

      it('should not validate a sub object which is not of type object', async function() {
        let nestedValidator = new Validator
        nestedValidator.add('nestedA', new Required)
        nestedValidator.add('nestedB', new TypeOf('number'))

        let validator = new Validator
        validator.add('a', nestedValidator)
  
        let misfits = await validator.validate({ a: 1})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(0)
      })

      it('should only collect one misfit for object constraints of the sub validator', async function() {
        let nestedValidator = new Validator
        nestedValidator.add('TestConstraint1', async () => new Misfit)
        nestedValidator.add('TestConstraint2', async () => new Misfit)

        let validator = new Validator
        validator.add('a', nestedValidator)
  
        let misfits = await validator.validate({ a: {} })
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(1)
        expect(misfits[0].constraint).to.equal('TestConstraint1')
        expect(misfits[0].properties).to.deep.equal(['a'])
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

      it('should not validate undefined elements of a sub array', async function() {
        let nestedValidator = new Validator
        nestedValidator.add('nestedA', new Required)
        nestedValidator.add('nestedB', new TypeOf('number'))

        let validator = new Validator
        validator.add('a', nestedValidator)
  
        let misfits = await validator.validate({ a: [{ nestedA: 'a', nestedB: false }, undefined, { nestedB: 1 }]})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(2)
        expect(misfits[0].constraint).to.equal('TypeOf')
        expect(misfits[0].properties).to.deep.equal(['a[0].nestedB'])
        expect(misfits[1].constraint).to.equal('Required')
        expect(misfits[1].properties).to.deep.equal(['a[2].nestedA'])
      })

      it('should not validate null elements of a sub array', async function() {
        let nestedValidator = new Validator
        nestedValidator.add('nestedA', new Required)
        nestedValidator.add('nestedB', new TypeOf('number'))

        let validator = new Validator
        validator.add('a', nestedValidator)
  
        let misfits = await validator.validate({ a: [{ nestedA: 'a', nestedB: false }, null, { nestedB: 1 }]})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(2)
        expect(misfits[0].constraint).to.equal('TypeOf')
        expect(misfits[0].properties).to.deep.equal(['a[0].nestedB'])
        expect(misfits[1].constraint).to.equal('Required')
        expect(misfits[1].properties).to.deep.equal(['a[2].nestedA'])
      })

      it('should not validate elements which are not of type object of a sub array', async function() {
        let nestedValidator = new Validator
        nestedValidator.add('nestedA', new Required)
        nestedValidator.add('nestedB', new TypeOf('number'))

        let validator = new Validator
        validator.add('a', nestedValidator)
  
        let misfits = await validator.validate({ a: [{ nestedA: 'a', nestedB: false }, null, { nestedB: 1 }]})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(2)
        expect(misfits[0].constraint).to.equal('TypeOf')
        expect(misfits[0].properties).to.deep.equal(['a[0].nestedB'])
        expect(misfits[1].constraint).to.equal('Required')
        expect(misfits[1].properties).to.deep.equal(['a[2].nestedA'])
      })

      it('should only collect one misfit for object constraints of the sub validator', async function() {
        let nestedValidator = new Validator
        nestedValidator.add('TestConstraint1', async () => new Misfit)
        nestedValidator.add('TestConstraint2', async () => new Misfit)

        let validator = new Validator
        validator.add('a', nestedValidator)
  
        let misfits = await validator.validate({ a: [ {}, {} ]})
  
        expect(misfits).to.be.instanceOf(Array)
        expect(misfits.length).to.equal(2)
        expect(misfits[0].constraint).to.equal('TestConstraint1')
        expect(misfits[0].properties).to.deep.equal(['a[0]'])
        expect(misfits[1].constraint).to.equal('TestConstraint1')
        expect(misfits[1].properties).to.deep.equal(['a[1]'])
      })
    })
  })
})