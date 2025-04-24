/**
 * Service that sends a follow-up email after successful email verification
 * during user sign-up.
 *
 * @implements TeqFw_Core_Shared_Api_Service
 */
export default class Fl64_Auth_Otp_Back_Email_SignUp_Confirm {
    /**
     * @param {Fl64_Auth_Otp_Back_Defaults} DEF
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     * @param {TeqFw_Db_Back_App_TrxWrapper} trxWrapper
     * @param {Fl64_Tmpl_Back_Service_Render} servRender
     * @param {TeqFw_Email_Back_Act_Send} actSend
     * @param {Fl64_Auth_Otp_Back_Api_Adapter} adapter
     * @param {Fl64_Auth_Otp_Back_Store_RDb_Repo_Email} repoEmail
     * @param {typeof Fl64_Tmpl_Back_Enum_Type} TMPL_TYPE
     */
    constructor(
        {
            Fl64_Auth_Otp_Back_Defaults$: DEF,
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Db_Back_App_TrxWrapper$: trxWrapper,
            Fl64_Tmpl_Back_Service_Render$: servRender,
            TeqFw_Email_Back_Act_Send$: actSend,
            Fl64_Auth_Otp_Back_Api_Adapter$: adapter,
            Fl64_Auth_Otp_Back_Store_RDb_Repo_Email$: repoEmail,
            Fl64_Tmpl_Back_Enum_Type$: TMPL_TYPE,
        }
    ) {
        // VARS
        const A_EMAIL = repoEmail.getSchema().getAttributes();
        const TMPL = 'signup/confirm';

        // FUNCS

        /**
         * Renders the email content for signup confirmation.
         * @param {TeqFw_Db_Back_RDb_ITrans} trx
         * @param {Fl64_Auth_Otp_Back_Store_RDb_Schema_Email.Dto} email
         * @param {string} localeUser
         * @param {string} localeApp
         * @returns {Promise<{html:string, text:string, subject:string}>}
         */
        async function prepareContent(trx, email, localeUser, localeApp) {
            const {vars: appVars, partials} = await adapter.getTmplDataEmailAuthenticate({trx, userId: email.user_ref});
            const view = {...appVars};

            const {content: html} = await servRender.perform({
                pkg: DEF.NAME,
                type: TMPL_TYPE.EMAIL,
                name: TMPL + '/body.html',
                localeUser,
                localeApp,
                localePkg: DEF.LOCALE,
                view,
                partials,
            });

            const {content: text} = await servRender.perform({
                pkg: DEF.NAME,
                type: TMPL_TYPE.EMAIL,
                name: TMPL + '/body.txt',
                localeUser,
                localeApp,
                localePkg: DEF.LOCALE,
                view,
                partials,
            });

            const {content: meta} = await servRender.perform({
                pkg: DEF.NAME,
                type: TMPL_TYPE.EMAIL,
                name: TMPL + '/meta.json',
                localeUser,
                localeApp,
                localePkg: DEF.LOCALE,
                view,
                partials,
            });

            const subject = JSON.parse(meta).subject;
            return {html, text, subject};
        }

        // MAIN
        /**
         * Sends a confirmation email after the user successfully verifies their email address.
         * @param {object} params - Parameters object.
         * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx]
         * @param {number} params.userId
         * @param {string} [params.localeUser]
         * @param {string} [params.localeApp]
         * @returns {Promise<{resultCode: string}>}
         */
        this.perform = async function ({trx: trxOuter, userId, localeUser, localeApp}) {
            let resultCode = RESULT_CODES.UNKNOWN_ERROR;
            await trxWrapper.execute(trxOuter, async function (trx) {
                const key = {[A_EMAIL.USER_REF]: userId};
                const {record} = await repoEmail.readOne({trx, key});
                if (record) {
                    const {html, text, subject} = await prepareContent(trx, record, localeUser, localeApp);
                    const to = record.email;
                    const {success} = await actSend.act({to, subject, text, html});
                    resultCode = success ? RESULT_CODES.SUCCESS : RESULT_CODES.EMAIL_SEND_FAILED;
                    logger.info(`Signup confirmation email sent to user #${userId}`);
                } else {
                    resultCode = RESULT_CODES.USER_NOT_FOUND;
                    logger.info(`User not found: userId=${userId}`);
                }
            });
            return {resultCode};
        };

        /**
         * Returns the result codes for this service.
         * @return {typeof Fl64_Auth_Otp_Back_Email_SignUp_Confirm.RESULT_CODES}
         */
        this.getResultCodes = () => RESULT_CODES;
    }
}

// VARS
/**
 * @memberOf Fl64_Auth_Otp_Back_Email_SignUp_Confirm
 */
const RESULT_CODES = {
    EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
    SUCCESS: 'SUCCESS',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
};
Object.freeze(RESULT_CODES);
