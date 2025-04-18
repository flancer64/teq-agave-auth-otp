/**
 * In-memory storage for XSRF tokens with expiration and capacity limit.
 *
 * @implements {TeqFw_Core_Shared_Api_Store_Memory<string>}
 */
export default class Fl64_Auth_Otp_Back_Store_Mem_XsrfToken {
    /**
     * @param {typeof import('node:crypto')} crypto
     * @param {TeqFw_Core_Shared_Api_Logger} logger - Logger instance.
     */
    constructor(
        {
            'node:crypto': crypto,
            TeqFw_Core_Shared_Api_Logger$$: logger,
        }
    ) {
        // VARS
        const {randomUUID} = crypto;
        const store = new Map();
        let maxSize = 1000;
        let defaultLifetime = 600000; // 10 min

        // MAIN
        /**
         * Removes expired items from storage.
         * @returns {void}
         */
        this.cleanup = function () {
            const now = Date.now();
            let removedCount = 0;

            for (const [key, {expiresAt}] of store.entries()) {
                if (expiresAt <= now) {
                    store.delete(key);
                    removedCount++;
                }
            }

            if (removedCount > 0) {
                logger.info(`Cleaned up ${removedCount} expired XSRF token(s).`);
            }
        };

        /**
         * Sets the default lifetime for stored tokens.
         *
         * @param {number} data - Default lifetime in milliseconds.
         * @returns {void}
         */
        this.configDefaultLifetime = function (data) {
            defaultLifetime = data;
        };

        /**
         * Sets the maximum number of stored tokens.
         *
         * @param {number} data - Maximum storage size.
         * @returns {void}
         */
        this.configMaxSize = function (data) {
            maxSize = data;
        };

        /**
         * Creates a new random token and stores it in the store.
         * @returns {string}
         */
        this.create = function () {
            const res = randomUUID();
            this.set({key: res});
            return res;
        };

        /**
         * Removes a data entry by its unique key.
         *
         * @param {Object} params
         * @param {string} params.key - Unique key identifier.
         * @returns {boolean} - True if the entry existed and was removed, false otherwise.
         */
        this.delete = function ({key}) {
            return store.delete(key);
        };

        /**
         * Retrieves data by a unique key.
         *
         * @param {Object} params
         * @param {string} params.key - Unique key identifier.
         * @returns {string|null} - The stored token, or null if not found or expired.
         */
        this.get = function ({key}) {
            const entry = store.get(key);
            if (entry && entry.expiresAt > Date.now()) {
                return key;
            } else {
                store.delete(key);
                return null;
            }
        };

        /**
         * Checks if a given key exists in the store.
         *
         * @param {Object} params
         * @param {string} params.key - Unique key identifier.
         * @returns {boolean} - True if the key exists and is not expired, false otherwise.
         */
        this.has = function ({key}) {
            const entry = store.get(key);
            return !!(entry && entry.expiresAt > Date.now());
        };

        /**
         * Saves data with a unique key and optional expiration time.
         *
         * If both `expiresAt` and `lifetime` are provided, `expiresAt` takes precedence.
         * If only `lifetime` is provided, the expiration time is calculated as `Date.now() + lifetime`.
         * If neither `expiresAt` nor `lifetime` is provided, the default lifetime is used.
         *
         * @param {Object} params
         * @param {string} params.key - Unique key identifier (token to store).
         * @param {number} [params.expiresAt] - Expiration timestamp (UNIX time in milliseconds).
         * @param {number} [params.lifetime] - Lifetime in milliseconds from now.
         * @returns {void}
         */
        this.set = function ({key, expiresAt, lifetime}) {
            const now = Date.now();
            const finalExpiresAt = expiresAt || (lifetime ? now + lifetime : now + defaultLifetime);

            // If storage is full, remove the oldest entry
            if (store.size >= maxSize) {
                const oldestKey = store.keys().next().value;
                if (oldestKey) {
                    store.delete(oldestKey);
                    logger.info(`If storage is full, the oldest entry is removed (${oldestKey}).`);
                }
            }

            store.set(key, {expiresAt: finalExpiresAt});
            logger.info(`XSRF token stored: ${key.substring(0, 8)}...`);
        };
    }
}
