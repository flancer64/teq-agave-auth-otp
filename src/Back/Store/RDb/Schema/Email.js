/**
 * Persistent DTO with metadata for the RDB entity: User Email for OTP authentication.
 * @namespace Fl64_Auth_Otp_Back_Store_RDb_Schema_Email
 */

// MODULE'S VARS

/**
 * Path to the entity in the plugin's DEM.
 *
 * @type {string}
 */
const ENTITY = '/fl64/auth/otp/email';

/**
 * Attribute mappings for the entity.
 * @memberOf Fl64_Auth_Otp_Back_Store_RDb_Schema_Email
 */
const ATTR = {
    DATE_CREATED: 'date_created',
    DATE_VERIFIED: 'date_verified',
    EMAIL: 'email',
    STATUS: 'status',
    USER_REF: 'user_ref',
};
Object.freeze(ATTR);

// MODULE'S CLASSES

/**
 * DTO class representing the persistent structure of the User Email entity.
 * @memberOf Fl64_Auth_Otp_Back_Store_RDb_Schema_Email
 */
class Dto {
    /**
     * Email address used for OTP authentication.
     *
     * @type {string}
     */
    email;

    /**
     * Reference to the user who owns this email.
     *
     * @type {number}
     */
    user_ref;

    /**
     * Verification status of the email.
     *
     * @type {string}
     * @see Fl64_Auth_Otp_Shared_Enum_Status
     */
    status;

    /**
     * Timestamp when the email record was created.
     *
     * @type {Date}
     */
    date_created = new Date();

    /**
     * Timestamp when the email was verified.
     *
     * @type {Date|null}
     */
    date_verified = null;
}

/**
 * Implements metadata and utility methods for the User Email entity.
 * @implements TeqFw_Db_Back_Api_RDb_Schema_Object
 */
export default class Fl64_Auth_Otp_Back_Store_RDb_Schema_Email {
    /**
     * Constructor for the User Email persistent DTO class.
     *
     * @param {Fl64_Auth_Otp_Back_Defaults} DEF
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     * @param {typeof Fl64_Auth_Otp_Shared_Enum_Status} STATUS
     */
    constructor(
        {
            Fl64_Auth_Otp_Back_Defaults$: DEF,
            TeqFw_Core_Shared_Util_Cast$: cast,
            'Fl64_Auth_Otp_Shared_Enum_Status.default': STATUS,
        }
    ) {
        // INSTANCE METHODS

        /**
         * Creates a DTO instance with validated attributes.
         *
         * @param {Fl64_Auth_Otp_Back_Store_RDb_Schema_Email.Dto|Object} [data]
         * @returns {Fl64_Auth_Otp_Back_Store_RDb_Schema_Email.Dto}
         */
        this.createDto = function (data) {
            const res = new Dto();
            if (data) {
                res.date_created = cast.date(data.date_created);
                res.date_verified = cast.date(data.date_verified);
                res.email = cast.string(data.email);
                res.status = cast.enum(data.status, STATUS);
                res.user_ref = cast.int(data.user_ref);
            }
            return res;
        };

        /**
         * Returns the attribute map for the entity.
         *
         * @returns {typeof Fl64_Auth_Otp_Back_Store_RDb_Schema_Email.ATTR}
         */
        this.getAttributes = () => ATTR;

        /**
         * Returns the entity's path in the DEM.
         *
         * @returns {string}
         */
        this.getEntityName = () => `${DEF.NAME}${ENTITY}`;

        /**
         * Returns the primary key attributes for the entity.
         *
         * @returns {Array<string>}
         */
        this.getPrimaryKey = () => [ATTR.USER_REF];
    }
}
