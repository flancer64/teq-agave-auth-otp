/**
 * Plugin constants (hardcoded configuration) for frontend code.
 */
export default class Fl64_Auth_Otp_Front_Defaults {

    /** @type {Fl64_Auth_Otp_Shared_Defaults} */
    SHARED;

    /**
     * @param {Fl64_Auth_Otp_Shared_Defaults} SHARED
     */
    constructor(
        {
            Fl64_Auth_Otp_Shared_Defaults$: SHARED,
        }
    ) {
        this.SHARED = SHARED;
        Object.freeze(this);
    }
}
