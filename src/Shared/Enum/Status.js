/**
 * Enum representing possible OTP authentication statuses.
 */
const Fl64_Auth_Otp_Shared_Enum_Status = {
    UNVERIFIED: 'UNVERIFIED', // OTP email has been registered but not verified.
    VERIFIED: 'VERIFIED',     // OTP email has been successfully verified.
    INACTIVE: 'INACTIVE',     // OTP email is no longer active for authentication.
};
Object.freeze(Fl64_Auth_Otp_Shared_Enum_Status);
export default Fl64_Auth_Otp_Shared_Enum_Status;
