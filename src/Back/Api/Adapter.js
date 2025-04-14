/**
 * Interface for adapting this plugin into the application.
 *
 * This is a documentation-only interface (not executable).
 *
 * @interface
 */
export default class Fl64_Auth_Otp_Back_Api_Adapter {
    /**
     * Checks if an email can be registered in the system.
     *
     * @param {Object} params - Input parameters.
     * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx] - Optional transaction context.
     * @param {string} [params.email] - Email address to check.
     * @returns {Promise<{allowed:boolean, reason:string}>} -
     *          Result object indicating if registration is allowed.
     *          If `allowed` is `false`, `reason` provides an explanation.
     * @throws {Error} Must be implemented in the application.
     */
    async canRegisterEmail({trx, email}) {
        throw new Error('Cannot instantiate an interface');
    }

    /**
     * Creates a new user in the application's database.
     *
     * @param {Object} params - Input parameters.
     * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx] - Optional transaction context.
     * @param {string} params.email - Email of the new user.
     * @returns {Promise<{id: number}>} -
     *          Object containing the unique ID of the newly created user.
     * @throws {Error} Must be implemented in the application.
     */
    async createUser({trx, email}) {
        throw new Error('Cannot instantiate an interface');
    }

    /**
     * Extracts locale preferences from the HTTP request.
     *
     * @param {Object} params - Input parameters.
     * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} params.req - The HTTP request object.
     * @returns {Promise<{localeUser:string, localeApp:string}>} -
     *          An object containing extracted locales:
     *          - `localeUser`: Preferred locale extracted from the `Accept-Language` header.
     *          - `localeApp`: Default application locale, usually configured globally.
     * @throws {Error} Must be implemented in the application.
     * @deprecated I use template plugin for page rendering
     */
    async getLocales({req}) {
        throw new Error('Cannot instantiate an interface');
    }

    /**
     * Retrieves additional template data for the authentication link email.
     *
     * This method allows the application to provide extra variables and template partials
     * that will be merged with the default ones used by the plugin when rendering
     * the authentication email template.
     *
     * @param {Object} params - Input parameters.
     * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx] - Optional transaction context.
     * @param {number} params.userId - The unique identifier of the user for whom the email is being generated.
     * @returns {Promise<{partials: Object, vars: Object}>} -
     *          A promise that resolves to an object containing template variables and partials.
     *          - `vars` (`Object`): A key-value map of additional variables to be used in the authentication email
     *            template. These variables are defined by the application and merged with the default plugin variables.
     *          - `partials` (`Object`): A key-value map of Mustache partial templates, where keys are the names
     *            of the partials and values are their corresponding template strings. These allow
     *            customization of email rendering by injecting application-specific template fragments.
     * @throws {Error} Must be implemented in the application.
     */
    async getTmplDataEmailAuthenticate({trx, userId}) {
        throw new Error('Cannot instantiate an interface');
    }

    /**
     * Retrieves additional template data for the registration email.
     *
     * This method allows the application to provide extra variables and template partials
     * that will be merged with the default ones used by the plugin when rendering
     * the registration email template.
     *
     * @param {Object} params - Input parameters.
     * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx] - Optional transaction context.
     * @param {number} params.userId - The unique identifier of the user for whom the email is being generated.
     * @returns {Promise<{partials: Object, vars: Object}>} -
     *          A promise that resolves to an object containing template variables and partials.
     *          - `vars` (`Object`): A key-value map of additional variables to be used in the registration email template.
     *            These variables are defined by the application and merged with the default plugin variables.
     *          - `partials` (`Object`): A key-value map of Mustache partial templates, where keys are the names
     *            of the partials and values are their corresponding template strings. These allow
     *            customization of email rendering by injecting application-specific template fragments.
     * @throws {Error} Must be implemented in the application.
     */
    async getTmplDataEmailRegister({trx, userId}) {
        throw new Error('Cannot instantiate an interface');
    }

}
