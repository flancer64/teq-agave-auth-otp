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
     * @param {Fl64_Tmpl_Back_Service_Render_Web} srvRender - Template renderer to render HTML responses
     * @param {Fl64_Otp_Back_Mod_Token} modToken - OTP token model to manage OTP tokens
     * @param {Fl64_Auth_Otp_Back_Email_SignIn_Confirm} emailConfirm - Email confirmation service
     * @param {Fl64_Web_Session_Back_Manager} session - Session manager for user session handling
     * @param {typeof Fl64_Auth_Otp_Back_Enum_Token_Type} OTP - Enum for OTP token types
     * @param {typeof Fl64_Auth_Otp_Shared_Enum_Web_Result_Authenticate} RESULT - Enum for authentication results
     */
    constructor(
        {
            'node:http2': http2,
            Fl64_Auth_Otp_Back_Defaults$: DEF,
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Web_Back_Help_Respond$: respond,
            TeqFw_Db_Back_App_TrxWrapper$: trxWrapper,
            Fl64_Tmpl_Back_Service_Render_Web$: srvRender,
            Fl64_Otp_Back_Mod_Token$: modToken,
            Fl64_Auth_Otp_Back_Email_SignIn_Confirm$: emailConfirm,
            Fl64_Web_Session_Back_Manager$: session,
            Fl64_Auth_Otp_Back_Enum_Token_Type$: OTP,
            Fl64_Auth_Otp_Shared_Enum_Web_Result_Authenticate$: RESULT,
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

                // If a token is present, start a transaction to process it
                await trxWrapper.execute(null, async (trx) => {
                    // FUNCS
                    /**
                     * Process the OTP token and initialize a session for the user if the token is valid.
                     * @param {TeqFw_Db_Back_RDb_ITrans} trx
                     * @param {string} token
                     * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} req - Incoming HTTP request object
                     * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} res - HTTP response object
                     * @returns {Promise<{result:string, uri401:string, userId:number}>}
                     */
                    async function processToken(trx, token, req, res) {
                        let result = RESULT.UNKNOWN_ERROR, uri401, userId;
                        if (token) {
                            // Read token details from the database
                            const {dto} = await modToken.read({trx, token});
                            if (dto && dto.type === OTP.AUTHENTICATION) {
                                userId = dto.user_ref;
                                // Delete the token after validation
                                await modToken.delete({trx, id: dto.id});
                                // Initialize a session for the user if the token is valid
                                const {sessionId, redirectUri: uriOn401} = await session.establish({
                                    trx,
                                    userId,
                                    req,
                                    res
                                });
                                if (sessionId) result = RESULT.SUCCESS;
                                else if (uriOn401) {
                                    result = RESULT.ERR_403;
                                    uri401 = uriOn401;
                                }
                            } else {
                                // Token isn't found or it has an invalid type
                                result = RESULT.WRONG_OTP;
                            }
                        } else {
                            result = RESULT.WRONG_OTP;
                        }
                        return {result, uri401, userId};
                    }

                    // MAIN
                    const {result: onToken, uri401, userId} = await processToken(trx, token, req, res);
                    result = onToken;
                    const {url: uriSession} = await session.retrieveRedirectUrl({req, remove: true});
                    if (result === RESULT.SUCCESS) {
                        // send the email in the separate transaction
                        trxWrapper.execute(null, async (trx) => {
                            await emailConfirm.perform({trx, userId});
                        }).catch(logger.exception);
                    }
                    if (result === RESULT.ERR_401) {
                        if (uri401) {
                            respond.code303_SeeOther({
                                res,
                                headers: {[HTTP2_HEADER_LOCATION]: uri401}
                            });
                        } else {
                            respond.code403_Forbidden({res});
                        }
                    } else if ((result === RESULT.SUCCESS) && uriSession) {
                        // Redirect the user if a valid redirect URL is present in the session
                        respond.code303_SeeOther({
                            res,
                            headers: {[HTTP2_HEADER_LOCATION]: uriSession}
                        });
                        logger.info(`User is authenticated and redirected to '${uriSession}'.`);
                    } else {
                        // Return a default web page with a message about login status
                        const {content: body} = await srvRender.perform({
                            name: 'authenticate.html',
                            pkg: DEF.NAME,
                            localePkg: DEF.LOCALE,
                            view: {
                                isSuccess: result === RESULT.SUCCESS,
                                isWrongOtp: result === RESULT.WRONG_OTP,
                                isUnknownError: result === RESULT.UNKNOWN_ERROR,
                            },
                            req,
                            trx,
                        });

                        // Respond with an HTML page and an appropriate message
                        respond.code200_Ok({
                            res,
                            body,
                            headers: {[HTTP2_HEADER_CONTENT_TYPE]: 'text/html'}
                        });
                    }
                });
            }

            // MAIN
            if (req.method === HTTP2_METHOD_GET) {
                await doGet(req, res);
            }
        };
    }
}
