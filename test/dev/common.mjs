import {configDto} from '@teqfw/test';

/**
 * @param {TeqFw_Di_Api_Container} container
 * @return {Promise<void>}
 */
export async function dbConnect(container) {
    /** @type {TeqFw_Core_Back_Config} */
    const config = await container.get('TeqFw_Core_Back_Config$');
    /** @type {TeqFw_Db_Back_RDb_Connect} */
    const conn = await container.get('TeqFw_Db_Back_RDb_IConnect$');
    /** @type {TeqFw_Db_Back_Defaults} */
    const DEF = await container.get('TeqFw_Db_Back_Defaults$');
    // Set up DB connection for the Object Container
    /** @type {TeqFw_Db_Back_Dto_Config_Local} */
    const cfg = config.getLocal(DEF.NAME);
    if (cfg?.connection) await conn.init(cfg);
}

/**
 * @param {TeqFw_Di_Api_Container} container
 * @return {Promise<void>}
 */
export async function dbDisconnect(container) {
    try {
        /** @type {TeqFw_Db_Back_RDb_Connect} */
        const conn = await container.get('TeqFw_Db_Back_RDb_IConnect$');
        await conn.disconnect();
    } catch (e) {
        debugger
    }
}


/**
 * @param {TeqFw_Di_Api_Container} container
 * @return {Promise<void>}
 */
export async function initConfig(container) {
    // Initialize environment configuration
    /** @type {TeqFw_Core_Back_Config} */
    const config = await container.get('TeqFw_Core_Back_Config$');
    config.init(configDto.pathToRoot, '0.0.0');

    // Set up console transport for the logger
    /** @type {TeqFw_Core_Shared_Logger_Base} */
    const base = await container.get('TeqFw_Core_Shared_Logger_Base$');
    /** @type {TeqFw_Core_Shared_Api_Logger_Transport} */
    const transport = await container.get('TeqFw_Core_Shared_Api_Logger_Transport$');
    base.setTransport(transport);
}
