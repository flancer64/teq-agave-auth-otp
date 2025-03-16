/**
 * Handles requests for the authentication and authorization processes using one-time passwords (OTP).
 */
export default class Fl64_Auth_Otp_Back_Web_Handler {
    /**
     * Initializes the handler with required dependencies.
     *
     * @param {typeof import('node:http2')} http2
     * @param {Fl64_Auth_Otp_Back_Defaults} DEF
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     * @param {TeqFw_Web_Back_Help_Respond} respond
     * @param {Fl64_Auth_Otp_Back_Web_Handler_A_Authenticate} aAuthenticate
     * @param {Fl64_Auth_Otp_Back_Web_Handler_A_Login} aLogin
     * @param {Fl64_Auth_Otp_Back_Web_Handler_A_Register} aRegister
     * @param {Fl64_Auth_Otp_Back_Web_Handler_A_Verify} aVerify
     */
    constructor(
        {
            'node:http2': http2,
            Fl64_Auth_Otp_Back_Defaults$: DEF,
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Web_Back_Help_Respond$: respond,
            Fl64_Auth_Otp_Back_Web_Handler_A_Authenticate$: aAuthenticate,
            Fl64_Auth_Otp_Back_Web_Handler_A_Login$: aLogin,
            Fl64_Auth_Otp_Back_Web_Handler_A_Register$: aRegister,
            Fl64_Auth_Otp_Back_Web_Handler_A_Verify$: aVerify,
        }
    ) {
        // VARS
        const {
            HTTP2_METHOD_GET,
            HTTP2_METHOD_POST,
        } = http2.constants;

        // MAIN

        /**
         * Handles incoming HTTP requests and delegates processing to specific handlers.
         *
         * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} req
         * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} res
         */
        async function process(req, res) {
            try {
                const fullPath = req.url.split('?')[0];
                const baseIndex = fullPath.indexOf(DEF.SHARED.SPACE);
                const relativePath = fullPath.slice(baseIndex + DEF.SHARED.SPACE.length + 1);
                const endpoint = relativePath.split('/')[0];

                switch (endpoint) {
                    case DEF.SHARED.ROUTE_AUTH:
                        await aAuthenticate.run(req, res);
                        break;
                    case DEF.SHARED.ROUTE_LOGIN:
                        await aLogin.run(req, res);
                        break;
                    case DEF.SHARED.ROUTE_REGISTER:
                        await aRegister.run(req, res);
                        break;
                    case DEF.SHARED.ROUTE_VERIFY:
                        await aVerify.run(req, res);
                        break;
                    default:
                        // If the endpoint is not recognized, do nothing and let other handlers process it
                        break;
                }
            } catch (error) {
                logger.exception(error);
                respond.code500_InternalServerError({res, body: error.message});
            }
        }

        /**
         * Provides the function to process requests.
         * @returns {Function}
         */
        this.getProcessor = () => process;

        /**
         * Placeholder for initialization logic.
         */
        this.init = async function () { };

        /**
         * Checks if the request can be handled by this instance.
         *
         * @param {Object} options
         * @param {string} options.method
         * @param {Object} options.address
         * @returns {boolean}
         */
        this.canProcess = function ({method, address} = {}) {
            return (
                ((method === HTTP2_METHOD_GET) || (method === HTTP2_METHOD_POST))
                && (address?.space === DEF.SHARED.SPACE)
            );
        };
    }
}
