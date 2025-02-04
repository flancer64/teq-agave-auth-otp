/**
 * Plugin constants (hardcoded configuration) for shared code.
 */
export default class Fl64_Auth_Otp_Shared_Defaults {

    NAME = '@flancer64/teq-agave-auth-otp';

    ROUTE_AUTH = 'auth/?otp=:otp';
    ROUTE_LOGIN = 'login';
    ROUTE_REGISTER = 'register';

    SPACE = 'fl64-auth-otp';

    constructor() {
        Object.freeze(this);
    }
}
