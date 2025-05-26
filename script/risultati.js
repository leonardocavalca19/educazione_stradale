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
function noaccesso() {
    window.location.href = "/login.html"
}
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("logoutBtn").addEventListener("click", function () {
        noaccesso()
        window.location.href = "/login.html";
    })
})