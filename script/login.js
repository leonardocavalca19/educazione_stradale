let utenti=[]
async function getutenti() {
    try {
        const response = await fetch("/json/utenti.json");
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}`);
        }
        const datiJSON = await response.json();
        for(let i=0;i<datiJSON.length;i++){
            utenti.push(new Utente(datiJSON[i].nome,datiJSON[i].cognome,datiJSON[i].email,datiJSON[i].passwordHash,datiJSON[i].dataNascita,datiJSON[i].test))
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

    document.getElementById("form").addEventListener("submit", function (event) {
        event.preventDefault();
        if (document.getElementById("passwordInput").checkValidity() && new RegExp("[ -~]{8}").test(document.getElementById("passwordInput").value)) {
            document.getElementById("passwordInput").style.borderColor = "green"
        }
        else {
            document.getElementById("passwordInput").style.borderColor = "red"
        }
        if (document.getElementById("emailInput").checkValidity()) {
            document.getElementById("emailInput").style.borderColor = "green"
        }
        else {
            document.getElementById("emailInput").style.borderColor = "red"
        }
        if (document.getElementById("emailInput").checkValidity() && document.getElementById("passwordInput").checkValidity() || new RegExp("[ -~]{8}").test(document.getElementById("passwordInput").value)) {
            if (Utente.login(document.getElementById("emailInput").value, document.getElementById("passwordInput").value) != null) {
                accesso = 1;
                if (document.getElementById("rememberMeCheck").checked) {
                    localStorage.setItem('utenteAccesso', accesso);
                }
                window.location.href = "/quiz.html";
            }
            else {
                document.getElementById("messaggioErrore").textContent = "Errore! Utente non trovato. Riprova"
                document.getElementById("messaggioErrore").style.display = ""
            }


        }
        else {
            document.getElementById("messaggioErrore").textContent = "Errore! Qualcosa è andato storto. Riprova"
            document.getElementById("messaggioErrore").style.display = ""

        }

    });
})
