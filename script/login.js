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

    } catch (error) {
        console.error("Impossibile caricare il file utenti.json:", error);
        utenti = [];
    }
}
getutenti()

document.addEventListener("DOMContentLoaded", function () {
    function noaccesso() {
        localStorage.removeItem('utenteAccesso');
        window.location.href = "/login.html"
    }
    document.getElementById("quizlink").addEventListener("click", function (event) {
        event.preventDefault()
        if (localStorage.getItem('utenteAccesso') == null) {
            noaccesso()
        }
        else {
            window.location.href = "/quiz.html"
        }
    })

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
                        sessionStorage.setItem('utenteAccesso', JSON.stringify(responseData.utente));
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
