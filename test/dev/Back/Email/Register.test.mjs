import {createContainer} from '@teqfw/test';
import {dbConnect, dbDisconnect, initConfig} from '../../common.mjs';
import assert from 'assert';

// CONTAINER SETUP
const container = await createContainer();
await initConfig(container);

// SUBJECT SETUP
/** @type {Fl64_Auth_Otp_Back_Email_Register} */
const emailReg = await container.get('Fl64_Auth_Otp_Back_Email_Register$');

// ENV SETUP

// TESTS
describe('Fl64_Auth_Otp_Back_Email_Register', () => {

    before(async () => {
        await dbConnect(container);
    });

    after(async () => {
        await dbDisconnect(container);
    });

    it('should send a email to user', async function () {
        this.timeout(5000);
        const CODES = emailReg.getResultCodes();
        const {resultCode} = await emailReg.perform({userId: 1});
        assert(resultCode, CODES.SUCCESS, 'Success result is expected');
    });
});