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
crea()
async function crea() {
    await getutenti()
    function noaccesso() {
        localStorage.removeItem('utenteAccesso');
        sessionStorage.removeItem('utenteAccesso');
        window.location.href = "/login.html"
    }
    let accesso
    if (sessionStorage.getItem('utenteAccesso') == null) {
        accesso = localStorage.getItem('utenteAccesso')
    }
    else if (sessionStorage.getItem('utenteAccesso') != null) {
        accesso = sessionStorage.getItem('utenteAccesso')
    }
    if (accesso) {
        try {
            for (let i = 0; i < utenti.length; i++) {
                if (utenti[i].email == JSON.parse(accesso).email) {
                    accesso = utenti[i]
                }
            }
        } catch (e) {
            console.error("Errore nel parsing dell'utente da localStorage:", e);
            noaccesso();
        }
    } else {
        noaccesso();
    }
    document.addEventListener("DOMContentLoaded", function () {
        if (localStorage.getItem('utenteAccesso') != null) {
            document.getElementById("nome").textContent = "Ciao " + JSON.parse(localStorage.getItem('utenteAccesso')).nome + " " + JSON.parse(localStorage.getItem('utenteAccesso')).cognome
        }
        else if (sessionStorage.getItem('utenteAccesso') != null) {
            document.getElementById("nome").textContent = "Ciao " + JSON.parse(sessionStorage.getItem('utenteAccesso')).nome + " " + JSON.parse(sessionStorage.getItem('utenteAccesso')).cognome
        }
        document.getElementById("profilo").addEventListener("click", function () {
            window.location.href = "/profilo.html"
        })

        document.getElementById("logoutBtn").addEventListener("click", function () {
            noaccesso()
            window.location.href = "/login.html";
        })
        const quiz=accesso.test[accesso.test.length-1]
        let errate=[]
        for (let i=0;i<quiz.domande.length;i++){
            if (!quiz.domande[i].controllagiusta()){
                errate.push(quiz.domande[i])
            }
        }
        if (errori.length <= 3) {
            document.getElementById("risposta").textContent = "Promosso! 🥳🥳"
            document.getElementById("divrisposta").style.backgroundColor = "green"
        }
        else {
            document.getElementById("risposta").textContent = "Bocciato 😓😓"
            document.getElementById("divrisposta").style.backgroundColor = "red"
        }


    })
}
