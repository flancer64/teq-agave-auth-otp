/**
 * Handler for verifying the email address of a user during registration
 * after they click the verification link sent to their email.
 */
export default class Fl64_Auth_Otp_Back_Web_Handler_A_Verify {
    /**
     * @param {typeof import('node:http2')} http2
     * @param {Fl64_Auth_Otp_Back_Defaults} DEF - Default configuration and constants
     * @param {TeqFw_Core_Shared_Api_Logger} logger - Logger instance to log actions
     * @param {TeqFw_Web_Back_Help_Respond} respond - Helper for sending HTTP responses
     * @param {TeqFw_Db_Back_App_TrxWrapper} trxWrapper - Transaction wrapper for database interactions
     * @param {Fl64_Tmpl_Back_Service_Render_Web} srvRender - Template renderer for generating HTML responses
     * @param {Fl64_Otp_Back_Mod_Token} modToken - OTP token model for handling OTP tokens
     * @param {Fl64_Web_Session_Back_Manager} session - Session manager to manage user sessions
     * @param {Fl64_Auth_Otp_Back_Store_RDb_Repo_Email} repoEmail - Repository for managing email-related data
     * @param {Fl64_Auth_Otp_Back_Email_SignUp_Confirm} emailConfirm
     * @param {typeof Fl64_Auth_Otp_Back_Enum_Token_Type} OTP_TYPE - Enum for OTP token types
     * @param {typeof Fl64_Auth_Otp_Shared_Enum_Status} STATUS - Enum for email verification status
     * @param {typeof Fl64_Auth_Otp_Shared_Enum_Web_Result_Verify} RESULT - Enum for the result of the verification process
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
            Fl64_Web_Session_Back_Manager$: session,
            Fl64_Auth_Otp_Back_Store_RDb_Repo_Email$: repoEmail,
            Fl64_Auth_Otp_Back_Email_SignUp_Confirm$: emailConfirm,
            Fl64_Auth_Otp_Back_Enum_Token_Type$: OTP_TYPE,
            Fl64_Auth_Otp_Shared_Enum_Status$: STATUS,
            Fl64_Auth_Otp_Shared_Enum_Web_Result_Verify$: RESULT,
        }
    ) {
        // VARS
        const {
            HTTP2_HEADER_CONTENT_TYPE,
            HTTP2_METHOD_GET,
        } = http2.constants;
        // Retrieve email schema attributes from the email repository
        const A_EMAIL = repoEmail.getSchema().getAttributes();

        // MAIN
        /**
         * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} req - Incoming HTTP request object
         * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} res - HTTP response object
         *
         * @return {Promise<void>} - Resolves once the request has been processed
         */
        this.run = async function (req, res) {
            // FUNCS
            /**
             * Process the GET request to verify the email using the OTP token.
             * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} req - Incoming HTTP request
             * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} res - HTTP response object
             * @returns {Promise<void>} - Resolves once the email verification is done
             */
            async function doGet(req, res) {
                let result = RESULT.UNKNOWN_ERROR;

                // Retrieve token from the URL query parameters
                const url = new URL(req.url, `https://${req.headers.host}`);
                const token = url.searchParams.get(DEF.SHARED.PARAM_TOKEN);

                if (token) {
                    // If a token exists, initiate a database transaction to process it
                    await trxWrapper.execute(null, async (trx) => {
                        // Read the token data from the OTP token model
                        const {dto} = await modToken.read({trx, token});
                        if (dto && dto.type === OTP_TYPE.EMAIL_VERIFICATION) {
                            const userId = dto.user_ref;

                            // Fetch the email record associated with the user ID
                            const {record: foundEmail} = await repoEmail.readOne({
                                trx,
                                key: {[A_EMAIL.USER_REF]: userId}
                            });

                            if (foundEmail && foundEmail.status === STATUS.UNVERIFIED) {
                                // If the email is found and unverified, mark it as verified
                                foundEmail.status = STATUS.VERIFIED;
                                foundEmail.date_verified = new Date();

                                // Update the email record in the database
                                await repoEmail.updateOne({trx, updates: foundEmail});
                                logger.info(`Email '${foundEmail.email}' is verified by user.`);

                                // Initialize a session for the user
                                await session.establish({
                                    trx,
                                    userId,
                                    httpRequest: req,
                                    httpResponse: res
                                });

                                // Delete the OTP token after it has been used
                                await modToken.delete({trx, id: dto.id});
                                // send the email in the separate transaction
                                trxWrapper.execute(null, async (trx) => {
                                    await emailConfirm.perform({trx, userId});
                                }).catch(logger.exception);
                                result = RESULT.SUCCESS;
                            } else {
                                // Token does not correspond to a valid email or the email is already verified
                                result = RESULT.WRONG_OTP;
                            }
                        } else {
                            // Token is either invalid or not of the correct type
                            result = RESULT.WRONG_OTP;
                        }
                    });
                } else {
                    result = RESULT.WRONG_OTP;
                }

                // Render the verification result page with the appropriate status
                const {content: body} = await srvRender.perform({
                    name: 'verify.html',
                    pkg: DEF.NAME,
                    localePkg: DEF.LOCALE,
                    view: {
                        isSuccess: result === RESULT.SUCCESS,
                        isUnknownError: result === RESULT.UNKNOWN_ERROR,
                        isWrongOtp: result === RESULT.WRONG_OTP,
                    },
                    req,
                });
                // Send a response with the rendered content
                respond.code200_Ok({
                    res,
                    body,
                    headers: {[HTTP2_HEADER_CONTENT_TYPE]: 'text/html'}
                });
            }

            // MAIN
            // Process only GETS requests for email verification
            if (req.method === HTTP2_METHOD_GET) {
                await doGet(req, res);
            }
        };
    }
}
