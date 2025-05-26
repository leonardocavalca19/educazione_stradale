let utenti = []
async function getutenti() {
    try {

        const timestamp = new Date().getTime();
        const response = await fetch(`/json/utenti.json?t=${timestamp}`); // Cache busting

        console.log(`STATO RISPOSTA FETCH per /json/utenti.json?t=${timestamp}: ${response.status} - ${response.statusText}`);

        // LEGGI LA RISPOSTA COME TESTO GREZZO PRIMA DI TUTTO
        const responseText = await response.text();
        console.log("**********************************************************************");
        console.log("TESTO GREZZO RICEVUTO DAL SERVER per utenti.json:");
        console.log(`"${responseText}"`); // Messo tra virgolette per vedere se è una stringa vuota o con solo spazi
        console.log("**********************************************************************");
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}`);
        }
        const datiJSON = await response.json();
        for (let i = 0; i < datiJSON.length; i++) {
            utenti.push(new Utente(datiJSON[i].nome, datiJSON[i].cognome, datiJSON[i].email, datiJSON[i].passwordHash, datiJSON[i].dataNascita, datiJSON[i].test))
        }
        if (responseText.trim() === "") {
            console.warn("ATTENZIONE: Il responseText ricevuto dal server è una stringa vuota o contiene solo spazi. Impossibile fare JSON.parse.");
            utenti = [];
            return; // Esce se il testo è vuoto
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
                    } else {
                        localStorage.setItem('utenteAccesso', JSON.stringify(responseData.utente));
                    }
                    window.location.href = "/quiz.html";
                } else {
                    document.getElementById("messaggioErrore").textContent = responseData.message || "Errore durante il login. Riprova.";
                    document.getElementById("messaggioErrore").style.display = "block";
                }
            } catch (error) {
                console.error("Errore nella richiesta di login:", error);
                document.getElementById("messaggioErrore").textContent = "Errore di connessione o risposta non valida dal server.";
                document.getElementById("messaggioErrore").style.display = "block";
            }
        } else {
            document.getElementById("messaggioErrore").textContent = "Errore! Email o password non validi. Riprova";
            document.getElementById("messaggioErrore").style.display = "block";
        }

    });
})
