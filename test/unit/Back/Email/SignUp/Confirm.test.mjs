import assert from 'assert';
import {describe, it} from 'mocha';
import {createContainer} from '@teqfw/test';

// Common mocks
const mockTrxWrapper = {
    execute: async (trxOuter, operation) => await operation(trxOuter ?? {})
};
const mockRepoEmail = {
    getSchema: () => ({getAttributes: () => ({USER_REF: 'user_ref'})}),
    readOne: async ({key}) => {
        if (key.user_ref === 123) {
            return {record: {user_ref: 123, email: 'test@example.com'}};
        }
        return {record: null};
    }
};
const mockModToken = {
    create: async () => ({token: 'abc123'})
};
const mockAdapter = {
    getTmplDataEmailRegister: async () => ({vars: {appVar: 'value'}, partials: {}})
};
const mockServRender = {
    perform: async ({name}) => {
        if (name.endsWith('meta.json')) {
            return {content: JSON.stringify({subject: 'Verify Your Email'})};
        }
        return {content: `Rendered content for ${name}`};
    }
};

describe('Fl64_Auth_Otp_Back_Email_SignUp_Confirm.perform', () => {

    async function createTestContainer(extraMocks = {}) {
        const container = await createContainer();
        container.enableTestMode();

        // Always needed
        container.register('TeqFw_Db_Back_App_TrxWrapper$', mockTrxWrapper);
        container.register('Fl64_Tmpl_Back_Service_Render$', mockServRender);
        container.register('Fl64_Auth_Otp_Back_Api_Adapter$', mockAdapter);
        container.register('Fl64_Auth_Otp_Back_Store_RDb_Repo_Email$', mockRepoEmail);
        container.register('Fl64_Otp_Back_Mod_Token$', mockModToken);

        // Apply any overrides
        for (const [key, value] of Object.entries(extraMocks)) {
            container.register(key, value);
        }

        return container;
    }

    describe('use cases', () => {
        it('should return SUCCESS if email is sent', async () => {
            const container = await createTestContainer({
                'TeqFw_Email_Back_Act_Send$': {
                    act: async () => ({success: true})
                }
            });
            const email = await container.get('Fl64_Auth_Otp_Back_Email_SignUp_Confirm$');
            const {resultCode} = await email.perform({userId: 123});
            assert.strictEqual(resultCode, 'SUCCESS');
        });

        it('should return EMAIL_SEND_FAILED if sending fails', async () => {
            const container = await createTestContainer({
                'TeqFw_Email_Back_Act_Send$': {
                    act: async () => ({success: false})
                }
            });
            const email = await container.get('Fl64_Auth_Otp_Back_Email_SignUp_Confirm$');
            const {resultCode} = await email.perform({userId: 123});
            assert.strictEqual(resultCode, 'EMAIL_SEND_FAILED');
        });

        it('should return USER_NOT_FOUND if no user found', async () => {
            const container = await createTestContainer({
                'TeqFw_Email_Back_Act_Send$': {
                    act: async () => ({success: true})
                }
            });
            const email = await container.get('Fl64_Auth_Otp_Back_Email_SignUp_Confirm$');
            const {resultCode} = await email.perform({userId: 999});
            assert.strictEqual(resultCode, 'USER_NOT_FOUND');
        });
    });


    describe('getResultCodes()', () => {
        it('should return exactly the expected result codes', async () => {
            const container = await createTestContainer({
                'TeqFw_Email_Back_Act_Send$': {
                    act: async () => ({success: true})
                }
            });
            const email = await container.get('Fl64_Auth_Otp_Back_Email_SignUp_Confirm$');
            const codes = email.getResultCodes();
            const expected = ['EMAIL_SEND_FAILED', 'SUCCESS', 'UNKNOWN_ERROR', 'USER_NOT_FOUND'];

            assert.deepStrictEqual(Object.keys(codes).sort(), expected.sort());
            for (const key of expected) {
                assert.strictEqual(codes[key], key, `Code for '${key}' should be equal to its key`);
            }
        });
    });
});