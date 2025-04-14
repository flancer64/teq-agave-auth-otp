/**
 * Handler for processing user login requests.
 */
export default class Fl64_Auth_Otp_Back_Web_Handler_A_Login {
    /**
     * Initializes the registration handler.
     *
     * @param {typeof import('node:crypto')} crypto
     * @param {typeof import('node:http2')} http2
     * @param {Fl64_Auth_Otp_Back_Defaults} DEF
     * @param {TeqFw_Core_Shared_Api_Logger} logger - Logger instance
     * @param {TeqFw_Web_Back_Help_Respond} respond
     * @param {TeqFw_Db_Back_App_TrxWrapper} trxWrapper
     * @param {Fl64_Tmpl_Back_Service_Render_Web} srvRender
     * @param {Fl64_Auth_Otp_Back_Store_Mem_XsrfToken} memXsrfToken
     * @param {Fl64_Auth_Otp_Back_Web_Helper} helper
     * @param {Fl64_Auth_Otp_Back_Api_Adapter} adapter
     * @param {Fl64_Auth_Otp_Back_Email_Login} servEmail
     * @param {Fl64_Auth_Otp_Back_Store_RDb_Repo_Email} repoEmail
     * @param {typeof Fl64_Auth_Otp_Shared_Enum_Status} STATUS
     * @param {typeof Fl64_Auth_Otp_Shared_Enum_Web_Result_Login} RESULT
     */
    constructor(
        {
            'node:crypto': crypto,
            'node:http2': http2,
            Fl64_Auth_Otp_Back_Defaults$: DEF,
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Web_Back_Help_Respond$: respond,
            TeqFw_Db_Back_App_TrxWrapper$: trxWrapper,
            Fl64_Tmpl_Back_Service_Render_Web$: srvRender,
            Fl64_Auth_Otp_Back_Store_Mem_XsrfToken$: memXsrfToken,
            Fl64_Auth_Otp_Back_Web_Helper$: helper,
            Fl64_Auth_Otp_Back_Api_Adapter$: adapter,
            Fl64_Auth_Otp_Back_Email_Login$: servEmail,
            Fl64_Auth_Otp_Back_Store_RDb_Repo_Email$: repoEmail,
            Fl64_Auth_Otp_Shared_Enum_Status$: STATUS,
            Fl64_Auth_Otp_Shared_Enum_Web_Result_Login$: RESULT,
        }
    ) {
        // VARS
        const {
            HTTP2_HEADER_CONTENT_TYPE,
            HTTP2_METHOD_GET,
            HTTP2_METHOD_POST,
        } = http2.constants;
        const {randomUUID} = crypto;

        const A_EMAIL = repoEmail.getSchema().getAttributes();
        const RESULT_EMAIL = servEmail.getResultCodes();

        // MAIN
        /**
         * Handles the provider selection action.
         *
         * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} req - Incoming HTTP request
         * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} res - HTTP response object
         *
         * @return {Promise<void>}
         */
        this.run = async function (req, res) {
            // FUNCS
            /**
             * Generate HTTP form to register a email address.
             * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} req - Incoming HTTP request
             * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} res - HTTP response object
             * @returns {Promise<void>}
             */
            async function doGet(req, res) {
                // generate XSRF token and render the from
                const xsrfToken = randomUUID();
                // TODO: I can wait some time before token generation to prevent DoS attacks
                //  (more tokens in the store - more waiting time)
                memXsrfToken.set({key: xsrfToken});
                const {content: body} = await srvRender.perform({
                    name: 'login.html',
                    pkg: DEF.NAME,
                    localePkg: DEF.LOCALE,
                    view: {xsrfToken},
                    req,
                });
                respond.code200_Ok({
                    res, body, headers: {
                        [HTTP2_HEADER_CONTENT_TYPE]: 'text/html'
                    }
                });
            }

            /**
             * Check XSRF token and email. Register a new user if email is valid.
             * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} req - Incoming HTTP request
             * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} res - HTTP response object
             * @returns {Promise<void>}
             */
            async function doPost(req, res) {
                const headers = {[HTTP2_HEADER_CONTENT_TYPE]: 'application/json'};
                /** @type {Fl64_Auth_Otp_Shared_Dto_Post_Register.Dto} */
                const posted = await helper.parsePostedData(req);
                if (posted?.xsrfToken && posted?.email) {
                    const xsrfPassed = memXsrfToken.has({key: posted.xsrfToken});
                    if (xsrfPassed) {
                        const email = posted.email.trim().toLowerCase();
                        await trxWrapper.execute(null, async (trx) => {
                            // check email existence in the plugin data
                            const {record} = await repoEmail.readOne({trx, key: {[A_EMAIL.EMAIL]: email}});
                            if (record && ((record.status === STATUS.VERIFIED) || (record.status === STATUS.UNVERIFIED))) {
                                // generate OTP and send email for active emails only
                                const {localeApp, localeUser} = await adapter.getLocales({req});
                                const {resultCode} = await servEmail.perform({
                                    trx,
                                    userId: record.user_ref,
                                    localeUser,
                                    localeApp
                                });
                                if (resultCode === RESULT_EMAIL.SUCCESS) {
                                    respond.code200_Ok({
                                        res, body: JSON.stringify({result: RESULT.SUCCESS}), headers
                                    });
                                    memXsrfToken.delete({key: posted.xsrfToken});
                                } else
                                    respond.code500_InternalServerError({
                                        res, body: JSON.stringify({result: RESULT.UNDEFINED}), headers
                                    });
                            } else {
                                logger.error(`Provided email '${email}' is not allowed.`);
                                respond.code200_Ok({
                                    res, body: JSON.stringify({result: RESULT.EMAIL_NOT_ALLOWED}), headers
                                });
                            }
                        });
                    } else {
                        logger.error(`Provided XSRF token '${posted?.xsrfToken}' is not found in the memory storage.`);
                        respond.code200_Ok({
                            res, body: JSON.stringify({result: RESULT.WRONG_XSRF}), headers
                        });
                    }
                } else {
                    logger.error(`Not enough data is provided in the request.`);
                    respond.code500_InternalServerError({
                        res, body: JSON.stringify({result: RESULT.UNDEFINED}), headers
                    });
                }
            }

            // MAIN
            if (req.method === HTTP2_METHOD_GET) {
                await doGet(req, res);
            } else if (req.method === HTTP2_METHOD_POST) {
                await doPost(req, res);
            }
        };
    }
}
