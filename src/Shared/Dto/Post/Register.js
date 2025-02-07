/**
 * @namespace Fl64_Auth_Otp_Shared_Dto_Post_Register
 * Namespace for the DTO used in the user registration process via OTP.
 */

// MODULE'S CLASSES
/**
 * DTO for handling user registration data.
 *
 * @memberOf Fl64_Auth_Otp_Shared_Dto_Post_Register
 */
class Dto {
    /** @type {string} User's email address. */
    email;

    /** @type {string} XSRF token for request validation. */
    xsrfToken;
}

/**
 * Factory class for creating DTO instances for user registration.
 *
 * @implements TeqFw_Core_Shared_Api_Factory_Dto
 */
export default class Fl64_Auth_Otp_Shared_Dto_Post_Register {
    /**
     * Initializes the DTO factory with utility functions.
     *
     * @param {TeqFw_Core_Shared_Util_Cast} cast - Utility for type casting.
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast
        }
    ) {
        // INSTANCE METHODS
        /**
         * Creates a new DTO and populates it with initialization data.
         * Ensures proper type casting for input values.
         *
         * @param {Fl64_Auth_Otp_Shared_Dto_Post_Register.Dto} [data]
         * @returns {Fl64_Auth_Otp_Shared_Dto_Post_Register.Dto}
         */
        this.createDto = function (data) {
            const res = Object.assign(new Dto(), data);
            if (data) {
                res.email = cast.string(data.email);
                res.xsrfToken = cast.string(data.xsrfToken);
            }
            return res;
        };
    }
}
