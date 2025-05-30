
function displayMessage(message, type) {
    const messageArea = document.getElementById('messageArea');
    messageArea.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible fade show" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('');

    messageArea.append(wrapper);
}

document.addEventListener("DOMContentLoaded", function () {
    function getInfoUtenteLoggatoPerLogin() {
        if (localStorage.getItem('utenteAccesso')) {
            return localStorage.getItem('utenteAccesso');
        }
        return sessionStorage.getItem('utenteAccesso');
    }
    avvio()

    function noaccessoPaginaLogin() {

        localStorage.removeItem('utenteAccesso');
        sessionStorage.removeItem('utenteAccesso');

        window.location.href = "/login.html";
    }
    async function avvio() {
        await getutenti()
        document.getElementById("form").addEventListener("submit", async function (event) {
            event.preventDefault();
            const emailInput = document.getElementById("emailInput");
            const passwordInput = document.getElementById("passwordInput");
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            let isEmailValid = emailInput.checkValidity() && email !== "";
            let isPasswordValid = passwordInput.checkValidity() && new RegExp("[ -~]{8}").test(password);

            emailInput.style.borderColor = isEmailValid ? "green" : "red";
            passwordInput.style.borderColor = isPasswordValid ? "green" : "red";

            if (isEmailValid && isPasswordValid) {
                try {
                    const response = await fetch('/login-utente', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email: email, password: password })
                    });

                    const responseData = await response.json();
                    if (!response.ok) {
                        displayMessage(responseData.message, responseData.type || 'danger');
                    }
                    if (response.ok) {
                        console.log("Login riuscito:", responseData);
                        if (document.getElementById("rememberMeCheck").checked) {
                            localStorage.setItem('utenteAccesso', JSON.stringify(responseData.utente));
                        } else {
                            sessionStorage.setItem('utenteAccesso', JSON.stringify(responseData.utente));
                        }

                        window.location.href = "/quiz.html";
                    }

                } catch (error) {
                    console.error("Errore nella richiesta di login:", error);
                }
            }

        });
    }
    const quizLinkLogin = document.getElementById("quizlink");
    if (quizLinkLogin) {
        quizLinkLogin.addEventListener("click", function (event) {
            event.preventDefault();
            if (getInfoUtenteLoggatoPerLogin() == null) {
                noaccessoPaginaLogin();
            } else {
                window.location.href = "/quiz.html";
            }
        });
    }


})
