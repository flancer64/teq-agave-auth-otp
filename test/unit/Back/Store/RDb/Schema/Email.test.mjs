import {container} from '@teqfw/test';
import assert from 'assert';

// GET OBJECTS FROM CONTAINER
/** @type {Fl64_Auth_Otp_Back_Defaults} */
const DEF = await container.get('Fl64_Auth_Otp_Back_Defaults$');
/** @type {Fl64_Auth_Otp_Back_Store_RDb_Schema_Email} */
const schema = await container.get('Fl64_Auth_Otp_Back_Store_RDb_Schema_Email$');

describe('Fl64_Auth_Otp_Back_Store_RDb_Schema_Email', () => {
    const ATTR = schema.getAttributes();
    const expectedProperties = [
        'date_created',
        'date_verified',
        'email',
        'status',
        'user_ref',
    ];

    it('should create an RDB DTO with only the expected properties', () => {
        const dto = schema.createDto();
        const dtoKeys = Object.keys(dto).sort();

        // Verify that the DTO has only the expected properties
        assert.deepStrictEqual(dtoKeys, expectedProperties.sort(), 'DTO should contain only the expected properties');

        // Check that each property is initially set correctly
        assert.strictEqual(dto.date_created instanceof Date, true, 'date_created should be a Date object');
        assert.strictEqual(dto.date_verified, null, 'date_verified should initially be null');
        assert.strictEqual(dto.status, undefined, 'status should default to undefined');
        assert.strictEqual(typeof dto.email, 'undefined', 'email should initially be undefined');
        assert.strictEqual(typeof dto.user_ref, 'undefined', 'user_ref should initially be undefined');
    });

    it('ATTR should contain only the expected properties', () => {
        const attrKeys = Object.keys(ATTR).sort();
        const upperCaseExpectedProperties = expectedProperties.map(p => p.toUpperCase()).sort();

        // Check that ATTR has the expected properties in uppercase
        assert.deepStrictEqual(attrKeys, upperCaseExpectedProperties, 'ATTR should contain only the expected properties in uppercase format');

        // Verify that each uppercase property in ATTR maps correctly to its original property name
        expectedProperties.forEach(prop => {
            assert.strictEqual(ATTR[prop.toUpperCase()], prop, `ATTR.${prop.toUpperCase()} should map to ${prop}`);
        });
    });

    it('should have the correct ENTITY name and primary key', () => {
        assert.equal(schema.getEntityName(), `${DEF.NAME}/fl64/auth/otp/email`, 'Entity name should match the expected path');
        assert.deepStrictEqual(schema.getPrimaryKey(), [ATTR.USER_REF], 'Primary key should be set to USER_REF');
    });

    it('should correctly cast input data into a DTO', () => {
        const input = {
            date_created: '2025-01-30T12:00:00Z',
            date_verified: '2025-01-31T12:00:00Z',
            email: 'test@example.com',
            status: 'VERIFIED',
            user_ref: 123,
        };
        const dto = schema.createDto(input);

        assert.strictEqual(dto.email, 'test@example.com', 'Email should be set correctly');
        assert.strictEqual(dto.status, 'VERIFIED', 'Status should be set correctly');
        assert.strictEqual(dto.user_ref, 123, 'User reference should be set correctly');
        assert.ok(dto.date_created instanceof Date, 'date_created should be a Date object');
        assert.ok(dto.date_verified instanceof Date, 'date_verified should be a Date object');
    });

    it('should handle missing optional fields correctly', () => {
        const input = {
            email: 'test@example.com',
            user_ref: 456,
        };
        const dto = schema.createDto(input);

        assert.strictEqual(dto.email, 'test@example.com', 'Email should be set correctly');
        assert.strictEqual(dto.user_ref, 456, 'User reference should be set correctly');
        assert.strictEqual(dto.status, undefined, 'Status should default to undefined');
        assert.strictEqual(dto.date_verified, undefined, 'date_verified should be undefined when missing');
    });
});
