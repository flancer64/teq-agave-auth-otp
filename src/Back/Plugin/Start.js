export default class Fl64_Auth_Otp_Back_Plugin_Start {
    /**
     * @param {Fl64_Auth_Otp_Back_Plugin_Z_Cron} zCron
     */
    constructor(
        {
            Fl64_Auth_Otp_Back_Plugin_Z_Cron$: zCron,
        }
    ) {
        return function () {
            zCron.start();
        };
    }
}
