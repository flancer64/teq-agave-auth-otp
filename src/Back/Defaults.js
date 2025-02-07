/**
 * Plugin constants (hardcoded configuration) for backend code.
 */
export default class Fl64_Auth_Otp_Back_Defaults {
    /** @type {string} default locale for this plugin */
    LOCALE = 'en';

    /** @type {TeqFw_Web_Back_Defaults} */
    MOD_WEB;

    /** @type {string} */
    NAME;

    /** @type {Fl64_Auth_Otp_Shared_Defaults} */
    SHARED;

    /**
     * @param {TeqFw_Web_Back_Defaults} MOD_WEB
     * @param {Fl64_Auth_Otp_Shared_Defaults} SHARED
     */
    constructor(
        {
            TeqFw_Web_Back_Defaults$: MOD_WEB,
            Fl64_Auth_Otp_Shared_Defaults$: SHARED
        }
    ) {
        this.MOD_WEB = MOD_WEB;
        this.NAME = SHARED.NAME;
        this.SHARED = SHARED;
        Object.freeze(this);
    }
}
