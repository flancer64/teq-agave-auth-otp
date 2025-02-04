// MODULE'S IMPORT
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {constants as H2} from 'node:http2';

// MODULE'S VARS
const {
    HTTP2_HEADER_CONTENT_TYPE,
} = H2;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Handler for processing user email registration requests.
 */
export default class Fl64_Auth_Otp_Back_Web_Handler_A_Register {
    /**
     * Initializes the registration handler.
     *
     * @param {Fl64_Auth_Otp_Back_Defaults} DEF
     * @param {TeqFw_Core_Shared_Api_Logger} logger - Logger instance
     * @param {TeqFw_Web_Back_App_Server_Respond} respond
     * @param {TeqFw_Db_Back_App_TrxWrapper} trxWrapper
     * @param {Fl64_Tmpl_Back_Service_Render} tmplRender
     */
    constructor({
                    Fl64_Auth_Otp_Back_Defaults$: DEF,
                    TeqFw_Core_Shared_Api_Logger$$: logger,
                    TeqFw_Web_Back_App_Server_Respond$: respond,
                    TeqFw_Db_Back_App_TrxWrapper$: trxWrapper,
                    Fl64_Tmpl_Back_Service_Render$: tmplRender,
                }) {
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
            await trxWrapper.execute(null, async (trx) => {
                // Respond with a success message
                const {content} = await tmplRender.perform({
                    pkg: DEF.NAME, type: 'web', name: 'register.html',
                });
                respond.status200(res, content, {
                    [HTTP2_HEADER_CONTENT_TYPE]: 'text/html'
                });
            });
        };
    }
}
