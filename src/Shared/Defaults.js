/**
 * Plugin constants (hardcoded configuration) for shared code.
 */
export default class Fl64_Auth_Otp_Shared_Defaults {
    /** @type {TeqFw_Web_Shared_Defaults} */
    MOD_WEB;

    NAME = '@flancer64/teq-agave-auth-otp';

    PARAM_TOKEN = 'token';
    PLACEHOLDER_OTP = ':otp_token';

    ROUTE_AUTH = 'auth?token=' + this.PLACEHOLDER_OTP;
    ROUTE_LOGIN = 'login';
    ROUTE_REGISTER = 'register';
    ROUTE_VERIFY = 'verify';

    SPACE = 'fl64-auth-otp';

    /**
     * @param {TeqFw_Web_Shared_Defaults} MOD_WEB
     */
    constructor(
        {
            TeqFw_Web_Shared_Defaults$: MOD_WEB,
        }
    ) {
        this.MOD_WEB = MOD_WEB;
        Object.freeze(this);
    }
}
