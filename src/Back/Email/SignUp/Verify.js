/**
 * Operation to send a verification email for user email address verification.
 *
 * @implements TeqFw_Core_Shared_Api_Service
 */
export default class Fl64_Auth_Otp_Back_Email_SignUp_Verify {
    /**
     * @param {Fl64_Auth_Otp_Back_Defaults} DEF
     * @param {TeqFw_Core_Back_Config} config
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     * @param {TeqFw_Db_Back_App_TrxWrapper} trxWrapper
     * @param {Fl64_Tmpl_Back_Service_Render} servRender
     * @param {TeqFw_Email_Back_Act_Send} actSend
     * @param {Fl64_Auth_Otp_Back_Api_Adapter} adapter
     * @param {Fl64_Auth_Otp_Back_Store_RDb_Repo_Email} repoEmail
     * @param {Fl64_Otp_Back_Mod_Token} modToken
     * @param {typeof Fl64_Tmpl_Back_Enum_Type} TMPL_TYPE
     * @param {typeof Fl64_Auth_Otp_Back_Enum_Token_Type} TOKEN
     */
    constructor(
        {
            Fl64_Auth_Otp_Back_Defaults$: DEF,
            TeqFw_Core_Back_Config$: config,
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Db_Back_App_TrxWrapper$: trxWrapper,
            Fl64_Tmpl_Back_Service_Render$: servRender,
            TeqFw_Email_Back_Act_Send$: actSend,
            Fl64_Auth_Otp_Back_Api_Adapter$: adapter,
            Fl64_Auth_Otp_Back_Store_RDb_Repo_Email$: repoEmail,
            Fl64_Otp_Back_Mod_Token$: modToken,
            Fl64_Tmpl_Back_Enum_Type$: TMPL_TYPE,
            Fl64_Auth_Otp_Back_Enum_Token_Type$: TOKEN,
        }
    ) {
        // VARS
        const A_EMAIL = repoEmail.getSchema().getAttributes();
        const OTP_LIFETIME = 24 * 3600; // 24 hours in seconds
        const TMPL = 'signup/verify';
        let URL_BASE;

        // FUNCS

        /**
         * Retrieves the URL for verification links.
         * This is constructed from the application configuration.
         * @param {string} token
         * @return {string}
         */
        function composeVerifyUrl(token) {
            if (!URL_BASE) {
                const web = config.getLocal(DEF.SHARED.MOD_WEB.NAME);
                const base = web.urlBase;
                const space = DEF.SHARED.SPACE;
                const param = DEF.SHARED.PARAM_TOKEN;
                URL_BASE = `https://${base}/${space}/${DEF.SHARED.ROUTE_VERIFY}?${param}=`;
            }
            return URL_BASE + token;
        }

        /**
         * @param {TeqFw_Db_Back_RDb_ITrans} trx
         * @param {Fl64_Auth_Otp_Back_Store_RDb_Schema_Email.Dto} email
         * @param {string} localeUser
         * @param {string} localeApp
         * @returns {Promise<{html:string, text:string, subject:string}>}
         */
        async function prepareContent(trx, email, localeUser, localeApp) {
            // create OTP-token to compose a verification link
            const {token} = await modToken.create({
                trx,
                userId: email.user_ref,
                type: TOKEN.EMAIL_VERIFICATION,
                lifetime: OTP_LIFETIME
            });
            const verifyLink = composeVerifyUrl(token);
            // load application level vars and partials for template processing
            const {vars: appVars, partials} = await adapter.getTmplDataEmailRegister({trx, userId: email.user_ref});
            const view = {verifyLink, ...appVars};
            // render HTML & text templates
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
            const json = JSON.parse(meta);
            const subject = json.subject; // see `meta.json` structure
            return {html, text, subject};
        }

        // MAIN
        /**
         * Sends a verification email for a specific user.
         * @param {TeqFw_Db_Back_RDb_ITrans} [trx] - Transaction context for database operations.
         * @param {number} userId - Identifier of the user to process.
         * @param {string} [localeUser]
         * @param {string} [localeApp]
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
                    logger.info(`Verification email sent successfully to user #${userId}`);
                } else {
                    resultCode = RESULT_CODES.USER_NOT_FOUND;
                    logger.info(`User not found: userId=${userId}`);
                }
            });
            return {resultCode};
        };

        /**
         * Returns the result codes for the operation.
         * @return {typeof Fl64_Auth_Otp_Back_Email_SignUp_Verify.RESULT_CODES}
         */
        this.getResultCodes = () => RESULT_CODES;
    }
}

// VARS
/**
 * @memberOf Fl64_Auth_Otp_Back_Email_SignUp_Verify
 */
const RESULT_CODES = {
    EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
    SUCCESS: 'SUCCESS',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
};
Object.freeze(RESULT_CODES);