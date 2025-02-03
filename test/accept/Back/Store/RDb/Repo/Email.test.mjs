import assert from 'assert';
import {createContainer} from '@teqfw/test';
import {dbConnect, dbCreateFkEntities, dbDisconnect, dbReset, initConfig} from '../../../../common.mjs';

// SETUP CONTAINER
const container = await createContainer();
await initConfig(container);

/** @type {Fl64_Auth_Otp_Back_Store_RDb_Repo_Email} */
const repoEmail = await container.get('Fl64_Auth_Otp_Back_Store_RDb_Repo_Email$');
/** @type {typeof Fl64_Auth_Otp_Shared_Enum_Status} */
const STATUS = await container.get('Fl64_Auth_Otp_Shared_Enum_Status.default');

// TEST CONSTANTS
const EMAIL = 'alex@flancer64.com';
let USER_REF;
describe('Fl64_Auth_Otp_Back_Store_RDb_Repo_Email', () => {

    before(async () => {
        await dbReset(container);
        const {user} = await dbCreateFkEntities(container);
        USER_REF = user.id;
        await dbConnect(container);
    });

    after(async () => {
        await dbDisconnect(container);
    });

    it('should create a new email entry', async () => {
        const dto = repoEmail.createDto();
        dto.user_ref = USER_REF;
        dto.email = EMAIL;
        dto.status = STATUS.INACTIVE;
        const {primaryKey} = await repoEmail.createOne({dto});
        assert.ok(primaryKey, 'Email should be created');
    });

    it('should read an existing email by key', async () => {
        const {record} = await repoEmail.readOne({key: USER_REF});
        assert.ok(record, 'Email should exist');
        assert.strictEqual(record.email, EMAIL, 'Email should match');
        assert.strictEqual(record.user_ref, USER_REF, 'User ref should match');
    });

    it('should list all email records', async () => {
        const emails = await repoEmail.readMany();
        assert.ok(emails.records.length > 0, 'There should be at least one email');
    });

    it('should update an existing email', async () => {
        const {record: updates} = await repoEmail.readOne({key: USER_REF});
        updates.status = STATUS.VERIFIED
        const {updatedCount} = await repoEmail.updateOne({
            key: USER_REF,
            updates,
        });
        assert.strictEqual(updatedCount, 1, 'One email should be updated');
        const {record} = await repoEmail.readOne({key: USER_REF});
        assert.strictEqual(record.status, STATUS.VERIFIED, 'Email status should be updated');
    });

    it('should delete an existing email', async () => {
        const {deletedCount} = await repoEmail.deleteOne({key: USER_REF});
        assert.strictEqual(deletedCount, 1, 'One email should be deleted');
    });
});
