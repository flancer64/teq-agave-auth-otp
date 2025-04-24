/**
 * This is a real email sending test. It uses an app configuration and templates.
 */
import assert from 'assert';
import {createContainer} from '@teqfw/test';
import {dbConnect, dbDisconnect, initConfig} from '../../../common.mjs';
import {after, before, describe, it} from 'mocha';

// CONTAINER SETUP
const container = await createContainer();
container.enableTestMode();
await initConfig(container);

// SUBJECT SETUP
/** @type {Fl64_Auth_Otp_Back_Email_SignIn_Confirm} */
const emailReg = await container.get('Fl64_Auth_Otp_Back_Email_SignIn_Confirm$');
const userId = 3; // alex@flancer32.com

// ENV SETUP

// TESTS
describe('Fl64_Auth_Otp_Back_Email_SignIn_Confirm', () => {

    before(async () => {
        await dbConnect(container);
    });

    after(async () => {
        await dbDisconnect(container);
    });

    it('should send a email to user', async function () {
        this.timeout(5000);
        const CODES = emailReg.getResultCodes();
        const {resultCode} = await emailReg.perform({userId});
        assert.strictEqual(resultCode, CODES.SUCCESS, 'Success result is expected');
    });
});