import {constants as H2} from 'node:http2';

// VARS
const {
    HTTP2_HEADER_CONTENT_RESULT,
    HTTP2_METHOD_GET,
} = H2;

/**
 * Handler for processing ...
 */
export default class Fl64_Auth_Otp_Back_Web_Handler_A_Authenticate {
    /**
     * @param {Fl64_Auth_Otp_Back_Defaults} DEF
     * @param {TeqFw_Core_Shared_Api_Logger} logger - Logger instance
     * @param {TeqFw_Web_Back_App_Server_Respond} respond
     * @param {TeqFw_Db_Back_App_TrxWrapper} trxWrapper
     * @param {Fl64_Tmpl_Back_Service_Render} tmplRender
     * @param {Fl64_Otp_Back_Mod_Token} modToken
     * @param {Fl64_Web_Session_Back_Manager} mgrSession
     * @param {Fl64_Auth_Otp_Back_Api_Adapter} adapter
     * @param {typeof Fl64_Auth_Otp_Back_Enum_Token_Type} OTP_TYPE
     * @param {typeof Fl64_Auth_Otp_Shared_Enum_Web_Result_Authenticate} RESULT
     * @param {typeof Fl64_Tmpl_Back_Enum_Type} TMPL_TYPE
     */
    constructor(
        {
            Fl64_Auth_Otp_Back_Defaults$: DEF,
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Web_Back_App_Server_Respond$: respond,
            TeqFw_Db_Back_App_TrxWrapper$: trxWrapper,
            Fl64_Tmpl_Back_Service_Render$: tmplRender,
            Fl64_Otp_Back_Mod_Token$: modToken,
            Fl64_Web_Session_Back_Manager$: mgrSession,
            Fl64_Auth_Otp_Back_Api_Adapter$: adapter,
            'Fl64_Auth_Otp_Back_Enum_Token_Type.default': OTP_TYPE,
            'Fl64_Auth_Otp_Shared_Enum_Web_Result_Authenticate.default': RESULT,
            'Fl64_Tmpl_Back_Enum_Type.default': TMPL_TYPE,
        }
    ) {
        // VARS
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
             * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} req - Incoming HTTP request
             * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} res - HTTP response object
             * @returns {Promise<void>}
             */
            async function doGet(req, res) {
                let result = RESULT.UNDEFINED;
                // get token from URL
                const url = new URL(req.url, `https://${req.headers.host}`);
                const token = url.searchParams.get(DEF.SHARED.PARAM_TOKEN);
                if (token) {
                    await trxWrapper.execute(null, async (trx) => {
                        const {dto} = await modToken.read({trx, token});
                        if (dto && dto.type === OTP_TYPE.AUTHENTICATION) {
                            const userId = dto.user_ref;
                            // initialize session
                            await mgrSession.establish({
                                trx,
                                userId,
                                httpRequest: req,
                                httpResponse: res
                            });
                            await modToken.delete({trx, id: dto.id});
                            result = RESULT.SUCCESS;
                        } else {
                            // token is not found or has a wrong type
                            result = RESULT.WRONG_OTP;
                        }
                    });
                } else {
                    result = RESULT.WRONG_OTP;
                }
                const {localeApp, localeUser} = await adapter.getLocales({req});
                const {content} = await tmplRender.perform({
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
                respond.status200(res, content, {
                    [HTTP2_HEADER_CONTENT_RESULT]: 'text/html'
                });
            }

            // MAIN
            if (req.method === HTTP2_METHOD_GET) {
                await doGet(req, res);
            }
        };
    }
}
