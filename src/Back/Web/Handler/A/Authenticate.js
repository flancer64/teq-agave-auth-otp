/**
 * Handler for processing OTP authentication when a user accesses the link from email
 */
export default class Fl64_Auth_Otp_Back_Web_Handler_A_Authenticate {
    /**
     * @param {typeof import('node:http2')} http2
     * @param {Fl64_Auth_Otp_Back_Defaults} DEF - Default configurations and constants
     * @param {TeqFw_Core_Shared_Api_Logger} logger - Logger instance for logging actions and errors
     * @param {TeqFw_Web_Back_Help_Respond} respond - Helper to respond to the client with HTTP codes and data
     * @param {TeqFw_Db_Back_App_TrxWrapper} trxWrapper - Transaction wrapper for database operations
     * @param {Fl64_Tmpl_Back_Service_Render} tmplRender - Template renderer to render HTML responses
     * @param {Fl64_Otp_Back_Mod_Token} modToken - OTP token model to manage OTP tokens
     * @param {Fl64_Web_Session_Back_Manager} session - Session manager for user session handling
     * @param {Fl64_Auth_Otp_Back_Api_Adapter} adapter - Adapter to interact with external services for locales
     * @param {typeof Fl64_Auth_Otp_Back_Enum_Token_Type} OTP_TYPE - Enum for OTP token types
     * @param {typeof Fl64_Auth_Otp_Shared_Enum_Web_Result_Authenticate} RESULT - Enum for authentication results
     * @param {typeof Fl64_Tmpl_Back_Enum_Type} TMPL_TYPE - Enum for template types
     */
    constructor(
        {
            'node:http2': http2,
            Fl64_Auth_Otp_Back_Defaults$: DEF,
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Web_Back_Help_Respond$: respond,
            TeqFw_Db_Back_App_TrxWrapper$: trxWrapper,
            Fl64_Tmpl_Back_Service_Render$: tmplRender,
            Fl64_Otp_Back_Mod_Token$: modToken,
            Fl64_Web_Session_Back_Manager$: session,
            Fl64_Auth_Otp_Back_Api_Adapter$: adapter,
            'Fl64_Auth_Otp_Back_Enum_Token_Type.default': OTP_TYPE,
            'Fl64_Auth_Otp_Shared_Enum_Web_Result_Authenticate.default': RESULT,
            'Fl64_Tmpl_Back_Enum_Type.default': TMPL_TYPE,
        }
    ) {
        // VARS
        const {
            HTTP2_HEADER_CONTENT_TYPE,
            HTTP2_HEADER_LOCATION,
            HTTP2_METHOD_GET,
        } = http2.constants;

        // MAIN
        /**
         * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} req - Incoming HTTP request object
         * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} res - HTTP response object
         *
         * @return {Promise<void>} - Returns a promise that resolves once the request is processed
         */
        this.run = async function (req, res) {
            // FUNCS
            /**
             * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} req - Incoming HTTP request object
             * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} res - HTTP response object
             * @returns {Promise<void>} - Returns a promise that resolves once the GET request is processed
             */
            async function doGet(req, res) {
                let result = RESULT.UNKNOWN_ERROR;

                // Extract OTP token from the URL parameters
                const url = new URL(req.url, `https://${req.headers.host}`);
                const token = url.searchParams.get(DEF.SHARED.PARAM_TOKEN);

                if (token) {
                    // If a token is present, start a transaction to process it
                    await trxWrapper.execute(null, async (trx) => {
                        // Read token details from the database
                        const {dto} = await modToken.read({trx, token});
                        if (dto && dto.type === OTP_TYPE.AUTHENTICATION) {
                            const userId = dto.user_ref;

                            // Initialize a session for the user if the token is valid
                            await session.establish({
                                trx,
                                userId,
                                httpRequest: req,
                                httpResponse: res
                            });

                            // Delete the token after successful authentication
                            await modToken.delete({trx, id: dto.id});
                            result = RESULT.SUCCESS;
                        } else {
                            // Token not found or it has an invalid type
                            result = RESULT.WRONG_OTP;
                        }
                    });
                } else {
                    result = RESULT.WRONG_OTP;
                }

                // Redirect the user if a valid redirect URL is present in the session
                const {url: redirectUrl} = await session.retrieveRedirectUrl({req, remove: true});
                if ((result === RESULT.SUCCESS) && redirectUrl) {
                    // Send a 303 redirect response
                    respond.code303_SeeOther({
                        res,
                        headers: {[HTTP2_HEADER_LOCATION]: redirectUrl}
                    });
                    logger.info(`User is authenticated and redirected to '${redirectUrl}'.`);
                } else {
                    // Return a default web page with a message about login status
                    const {localeApp, localeUser} = await adapter.getLocales({req});
                    const {content: body} = await tmplRender.perform({
                        pkg: DEF.NAME,
                        type: TMPL_TYPE.WEB,
                        name: 'authenticate.html',
                        view: {
                            isSuccess: result === RESULT.SUCCESS,
                            isWrongOtp: result === RESULT.WRONG_OTP,
                            isUnknownError: result === RESULT.UNKNOWN_ERROR,
                        },
                        localeUser,
                        localeApp,
                        localePkg: DEF.LOCALE,
                    });

                    // Respond with an HTML page and an appropriate message
                    respond.code200_Ok({
                        res,
                        body,
                        headers: {[HTTP2_HEADER_CONTENT_TYPE]: 'text/html'}
                    });
                }
            }

            // MAIN
            // Handle only GET requests
            if (req.method === HTTP2_METHOD_GET) {
                await doGet(req, res);
            }
        };
    }
}
