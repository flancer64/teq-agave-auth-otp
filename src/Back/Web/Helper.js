// IMPORT
import {constants as H2} from 'node:http2';
import {URLSearchParams} from 'node:url';

// VARS
const {
    HTTP2_HEADER_CONTENT_TYPE,
} = H2;

export default class Fl64_Auth_Otp_Back_Web_Helper {
    /**
     * @param {Fl64_Auth_Otp_Back_Defaults} DEF
     */
    constructor(
        {
            Fl64_Auth_Otp_Back_Defaults$: DEF,
        }
    ) {
        // VARS
        // FUNCS
        // MAIN
        /**
         * Parses the request body, supporting both JSON and x-www-form-urlencoded formats.
         *
         * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} req - Incoming HTTP request.
         * @return {Promise<*>} Parsed request body as an object.
         */
        this.parsePostedData = async function (req) {
            let body = {};
            const shares = req[DEF.MOD_WEB.HNDL_SHARE];

            // Check if the request body is already available in shared memory
            if (shares?.[DEF.MOD_WEB.SHARE_REQ_BODY_JSON]) {
                body = shares[DEF.MOD_WEB.SHARE_REQ_BODY_JSON];
            } else {
                const buffers = [];
                for await (const chunk of req) {
                    buffers.push(chunk);
                }
                const rawBody = Buffer.concat(buffers).toString();

                // Detect content type and parse accordingly
                const contentType = req.headers[HTTP2_HEADER_CONTENT_TYPE] || '';

                if (contentType.includes('application/json')) {
                    body = JSON.parse(rawBody);
                } else if (contentType.includes('application/x-www-form-urlencoded')) {
                    body = Object.fromEntries(new URLSearchParams(rawBody));
                }
            }
            return body;
        };

    }
}
