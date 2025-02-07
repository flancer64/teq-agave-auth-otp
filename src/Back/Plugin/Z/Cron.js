export default class Fl64_Auth_Otp_Back_Plugin_Z_Cron {
    /**
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     * @param {Fl64_Auth_Otp_Back_Store_Mem_XsrfToken} memXsrfToken
     */
    constructor(
        {
            TeqFw_Core_Shared_Api_Logger$$: logger,
            Fl64_Auth_Otp_Back_Store_Mem_XsrfToken$: memXsrfToken,
        }
    ) {
        // VARS
        let cleanupXsrfToken = null;

        // MAIN
        this.start = function () {
            cleanupXsrfToken = setInterval(memXsrfToken.cleanup, 60000); // Every 1 minute
            logger.info(`Cleanup process for 'memXsrfToken' is started.`);
        };

        this.stop = function () {
            if (cleanupXsrfToken) {
                clearInterval(cleanupXsrfToken);
                logger.info(`Cleanup process for 'memXsrfToken' is stopped.`);
            }
        };
    }
}
