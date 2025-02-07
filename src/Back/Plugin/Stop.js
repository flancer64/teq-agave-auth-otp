export default class Fl64_Auth_Otp_Back_Plugin_Stop {
    /**
     * @param {Fl64_Auth_Otp_Back_Plugin_Z_Cron} zCron
     */
    constructor(
        {
            Fl64_Auth_Otp_Back_Plugin_Z_Cron$: zCron,
        }
    ) {
        return function () {
            zCron.stop();
        };
    }
}
