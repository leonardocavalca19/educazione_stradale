let utenti = []
async function getutenti() {
    try {
        const response = await fetch("/json/utenti.json");
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}`);
        }
        const datiJSON = await response.json();
        for (let i = 0; i < datiJSON.length; i++) {
            utenti.push(new Utente(datiJSON[i].nome, datiJSON[i].cognome, datiJSON[i].email, datiJSON[i].passwordHash, datiJSON[i].dataNascita, datiJSON[i].test))
        }
        for (let i = 0; i < utenti.length; i++) {
            if (utenti[i].test != null) {
                let tests = []
                for (let j = 0; j < utenti[i].test.length; j++) {
                    tests.push(new Quiz(utenti[i].test[j].domande));
                    tests[j].realizazzione = utenti[i].test[j].realizazzione;
                    let domande = []
                    for (let k = 0; k < tests[j].domande.length; k++) {
                        domande.push(new Domanda(tests[j].domande[k].testo, tests[j].domande[k].corretta, null));
                        domande[k].risposta = tests[j].domande[k].risposta;
                        if (tests[j].domande[k].img != null) {
                            domande[k].img = tests[j].domande[k].img;
                        }
                    }
                    tests[j].domande = domande;
                }
                utenti[i].test = tests;
            }
        }


    } catch (error) {
        console.error("Impossibile caricare il file utenti.json:", error);
        utenti = [];
    }
}
getutenti()

document.addEventListener("DOMContentLoaded", function () {
    function getInfoUtenteLoggatoPerLogin() {
        if (localStorage.getItem('utenteAccesso')) {
            return localStorage.getItem('utenteAccesso');
        }
        return sessionStorage.getItem('utenteAccesso');
    }

    function noaccessoPaginaLogin() {

        localStorage.removeItem('utenteAccesso');
        sessionStorage.removeItem('utenteAccesso');

        window.location.href = "/login.html";
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

                if (response.ok) {
                    console.log("Login riuscito:", responseData);
                    if (document.getElementById("rememberMeCheck").checked) {
                        localStorage.setItem('utenteAccesso', JSON.stringify(responseData.utente));
                        window.location.href = "/quiz.html";
                    } else {
                        sessionStorage.setItem('utenteAccesso', JSON.stringify(responseData.utente));
                        window.location.href = "/quiz.html";
                    }
                }
            } catch (error) {
                console.error("Errore nella richiesta di login:", error);
            }
        }

    });
})
