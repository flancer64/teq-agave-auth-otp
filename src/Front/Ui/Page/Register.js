export default class Fl64_Auth_Otp_Front_Ui_Page_Register {
    /**
     * @param {Fl64_Auth_Otp_Shared_Dto_Post_Register} dtoPost
     * @param {typeof Fl64_Auth_Otp_Shared_Enum_Web_Result_Register} RESULT
     */
    constructor(
        {
            Fl64_Auth_Otp_Shared_Dto_Post_Register$: dtoPost,
            Fl64_Auth_Otp_Shared_Enum_Web_Result_Register$: RESULT
        }
    ) {
        // FUNCS
        /**
         * Display loading state.
         * @param {boolean} isLoading
         */
        function setLoading(isLoading) {
            const loadingIndicator = document.getElementById('loading');
            const button = document.querySelector('button[type="submit"]');
            loadingIndicator.style.display = isLoading ? 'block' : 'none';
            button.disabled = isLoading;
        }

        /**
         * Handle error messages by showing the appropriate localized message.
         * @param {string} errorCode
         */
        function handleError(errorCode) {
            const errorBlocks = document.querySelectorAll('.error-message');
            errorBlocks.forEach(block => block.style.display = 'none'); // Hide all error messages

            const errorMsg = document.getElementById(`error-${errorCode}`);
            if (errorMsg) {
                errorMsg.style.display = 'block';
            } else {
                document.getElementById('error-UNDEFINED').style.display = 'block'; // Default error message
            }
        }

        /**
         * Clear any displayed messages.
         */
        function clearMessages() {
            document.getElementById('success-msg').style.display = 'none';
            document.querySelectorAll('.error-message').forEach(block => block.style.display = 'none');
        }

        // MAIN
        const form = document.getElementById('email-form');
        const emailInput = document.getElementById('email');
        const xsrfTokenInput = document.getElementById('xsrf_token');
        const successMsg = document.getElementById('success-msg');
        debugger
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearMessages();
            setLoading(true);

            const body = dtoPost.createDto();
            body.email = emailInput.value.trim();
            body.xsrfToken = xsrfTokenInput.value;

            try {
                const response = await fetch('/fl64-auth-otp/register', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(body),
                });

                const result = await response.json();
                if (response.ok && result.result === RESULT.SUCCESS) {
                    successMsg.style.display = 'block';
                } else {
                    handleError(result.result);
                }
            } catch (error) {
                handleError(RESULT.UNDEFINED);
            } finally {
                setLoading(false);
            }
        });

    }
}
